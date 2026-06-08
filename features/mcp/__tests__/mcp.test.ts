// @vitest-environment node

import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/features/tournament/server/get-tournament-leaderboard", () => ({
    getTournamentLeaderboard: vi.fn(),
}));

import { BetResult } from "@prisma/client";

import { handleMcpRequest } from "@/features/mcp/api/mcp";
import { signAccessToken } from "@/features/oauth/server/jwt";
import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";
import {
    makeBet,
    makeGame,
    makeGroup,
    makeGroupMember,
    makeTournament,
    makeUser,
} from "@/test/factories";
import { prisma } from "@/test/prisma";

beforeAll(() => {
    process.env.AUTH_SECRET =
        "test-secret-for-mcp-tests-at-least-32-chars-long!";
});

function mcpRequest(body: unknown, authHeader?: string) {
    return new Request("http://test.local/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
            ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
    });
}

async function callTool(
    name: string,
    args: Record<string, unknown> = {},
    userId = "user_test_1",
) {
    const token = await signAccessToken(userId);
    const req = mcpRequest(
        {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name, arguments: args },
        },
        `Bearer ${token}`,
    );
    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    return body.result as {
        isError?: boolean;
        content: { type: string; text: string }[];
    };
}

describe("handleMcpRequest — authentication", () => {
    it("returns 401 with WWW-Authenticate when no Authorization header", async () => {
        const req = mcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(401);
        const wwwAuth = res.headers.get("www-authenticate") ?? "";
        expect(wwwAuth).toContain("Bearer");
        expect(wwwAuth).toContain("/.well-known/oauth-protected-resource");
    });

    it("returns 401 when Authorization header has no Bearer prefix", async () => {
        const req = mcpRequest(
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            "Basic dXNlcjpwYXNz",
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(401);
    });

    it("returns 401 for an invalid JWT", async () => {
        const req = mcpRequest(
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            "Bearer not.a.valid.jwt",
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(401);
        const wwwAuth = res.headers.get("www-authenticate") ?? "";
        expect(wwwAuth).toContain("Bearer");
    });
});

describe("handleMcpRequest — tools/list", () => {
    it("returns tool list for authenticated request", async () => {
        const token = await signAccessToken("user_test_1");
        const req = mcpRequest(
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            `Bearer ${token}`,
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(200);
        const body = (await res.json()) as Record<string, unknown>;
        const result = body.result as { tools: { name: string }[] };
        const toolNames = result.tools.map((tool) => tool.name);
        expect(toolNames).toEqual(
            expect.arrayContaining([
                "whoami",
                "list_my_tournaments",
                "list_upcoming_games",
                "list_finished_games",
                "place_bet",
                "get_leaderboard",
            ]),
        );
    });
});

describe("handleMcpRequest — whoami tool", () => {
    it("returns user info for a valid token", async () => {
        const token = await signAccessToken("user_test_1");
        prisma.user.findUnique.mockResolvedValue(
            makeUser({
                id: "user_test_1",
                name: "Jan Kowalski",
                email: "jan@test.dev",
            }),
        );

        const req = mcpRequest(
            {
                jsonrpc: "2.0",
                id: 2,
                method: "tools/call",
                params: { name: "whoami", arguments: {} },
            },
            `Bearer ${token}`,
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(200);

        const body = (await res.json()) as Record<string, unknown>;
        const result = body.result as {
            content: { type: string; text: string }[];
        };
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe("text");

        const parsed = JSON.parse(result.content[0].text) as Record<
            string,
            unknown
        >;
        expect(parsed.id).toBe("user_test_1");
        expect(parsed.name).toBe("Jan Kowalski");
        expect(parsed.email).toBe("jan@test.dev");
    });

    it("returns error content when user not found in db", async () => {
        const token = await signAccessToken("ghost_user");
        prisma.user.findUnique.mockResolvedValue(null);

        const req = mcpRequest(
            {
                jsonrpc: "2.0",
                id: 3,
                method: "tools/call",
                params: { name: "whoami", arguments: {} },
            },
            `Bearer ${token}`,
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(200);

        const body = (await res.json()) as Record<string, unknown>;
        const result = body.result as {
            isError?: boolean;
            content: { type: string; text: string }[];
        };
        expect(result.isError).toBe(true);
    });
});

describe("handleMcpRequest — list_my_tournaments tool", () => {
    it("returns tournaments grouped by group", async () => {
        prisma.groupMember.findMany.mockResolvedValue([
            {
                ...makeGroupMember({ userId: "user_test_1" }),
                group: {
                    ...makeGroup(),
                    tournaments: [
                        {
                            ...makeTournament(),
                            _count: { games: 5 },
                        },
                    ],
                },
            },
        ] as never);

        const result = await callTool("list_my_tournaments");
        const parsed = JSON.parse(result.content[0].text) as {
            groups: {
                groupName: string;
                tournaments: { id: string; name: string }[];
            }[];
        };

        expect(parsed.groups).toHaveLength(1);
        expect(parsed.groups[0].groupName).toBe("Test Group");
        expect(parsed.groups[0].tournaments[0]).toEqual({
            id: "tournament_test_1",
            name: "Test Tournament",
            season: null,
            gameCount: 5,
        });
    });
});

describe("handleMcpRequest — list_upcoming_games tool", () => {
    it("returns upcoming games with the user's bet", async () => {
        const kickoffAt = new Date("2030-06-01T18:00:00.000Z");
        prisma.tournament.findUnique.mockResolvedValue({
            ...makeTournament({ id: "t1" }),
            games: [
                {
                    ...makeGame({
                        id: "g_upcoming",
                        kickoffAt,
                        homeScore: null,
                        awayScore: null,
                    }),
                    bets: [
                        {
                            userId: "user_test_1",
                            homeScore: 2,
                            awayScore: 1,
                            betResult: null,
                        },
                    ],
                },
            ],
            group: {
                members: [
                    {
                        userId: "user_test_1",
                        user: { name: "Jan Kowalski" },
                    },
                ],
            },
        } as never);
        prisma.groupMember.findFirst.mockResolvedValue(makeGroupMember());

        const result = await callTool("list_upcoming_games", {
            tournamentId: "t1",
        });
        const parsed = JSON.parse(result.content[0].text) as {
            games: {
                id: string;
                myBet: { homeScore: number; awayScore: number } | null;
            }[];
        };

        expect(parsed.games).toHaveLength(1);
        expect(parsed.games[0]).toEqual({
            id: "g_upcoming",
            homeTeam: "Home FC",
            awayTeam: "Away FC",
            kickoffAt: kickoffAt.toISOString(),
            myBet: { homeScore: 2, awayScore: 1 },
        });
    });

    it("returns error when user has no access", async () => {
        prisma.tournament.findUnique.mockResolvedValue(makeTournament());
        prisma.groupMember.findFirst.mockResolvedValue(null);

        const result = await callTool("list_upcoming_games", {
            tournamentId: "tournament_test_1",
        });

        expect(result.isError).toBe(true);
    });
});

describe("handleMcpRequest — list_finished_games tool", () => {
    it("returns finished games with all players' bets", async () => {
        prisma.tournament.findUnique.mockResolvedValue({
            ...makeTournament({ id: "t1" }),
            games: [
                {
                    ...makeGame({
                        id: "g_finished",
                        homeScore: 2,
                        awayScore: 1,
                    }),
                    bets: [
                        {
                            userId: "user_test_1",
                            homeScore: 2,
                            awayScore: 1,
                            betResult: BetResult.EXACT_SCORE,
                        },
                        {
                            userId: "user_test_2",
                            homeScore: 1,
                            awayScore: 0,
                            betResult: BetResult.CORRECT_OUTCOME,
                        },
                    ],
                },
            ],
            group: {
                members: [
                    {
                        userId: "user_test_1",
                        user: { name: "Jan Kowalski" },
                    },
                    {
                        userId: "user_test_2",
                        user: { name: "Anna Nowak" },
                    },
                ],
            },
        } as never);
        prisma.groupMember.findFirst.mockResolvedValue(makeGroupMember());

        const result = await callTool("list_finished_games", {
            tournamentId: "t1",
        });
        const parsed = JSON.parse(result.content[0].text) as {
            games: {
                homeScore: number;
                awayScore: number;
                bets: { name: string; betResult: string }[];
            }[];
        };

        expect(parsed.games).toHaveLength(1);
        expect(parsed.games[0].homeScore).toBe(2);
        expect(parsed.games[0].awayScore).toBe(1);
        expect(parsed.games[0].bets).toEqual([
            {
                name: "Jan Kowalski",
                homeScore: 2,
                awayScore: 1,
                betResult: BetResult.EXACT_SCORE,
            },
            {
                name: "Anna Nowak",
                homeScore: 1,
                awayScore: 0,
                betResult: BetResult.CORRECT_OUTCOME,
            },
        ]);
    });
});

describe("handleMcpRequest — place_bet tool", () => {
    it("places a bet for an upcoming game", async () => {
        const futureKickoff = new Date(Date.now() + 3_600_000);
        prisma.game.findUnique.mockResolvedValue({
            ...makeGame({ id: "g1", kickoffAt: futureKickoff }),
            tournament: { groupId: "group_test_1" },
        } as never);
        prisma.groupMember.findFirst.mockResolvedValue(makeGroupMember());
        prisma.bet.upsert.mockResolvedValue(
            makeBet({ gameId: "g1", homeScore: 2, awayScore: 1 }),
        );

        const result = await callTool("place_bet", {
            gameId: "g1",
            homeScore: 2,
            awayScore: 1,
        });
        const parsed = JSON.parse(result.content[0].text) as {
            homeScore: number;
            awayScore: number;
        };

        expect(parsed).toEqual({ homeScore: 2, awayScore: 1 });
    });
});

describe("handleMcpRequest — get_leaderboard tool", () => {
    it("returns leaderboard for an accessible tournament", async () => {
        prisma.tournament.findUnique.mockResolvedValue({
            ...makeTournament({ id: "t1" }),
            games: [],
            group: {
                members: [
                    {
                        userId: "user_test_1",
                        user: { name: "Jan Kowalski" },
                    },
                ],
            },
        } as never);
        prisma.groupMember.findFirst.mockResolvedValue(makeGroupMember());
        vi.mocked(getTournamentLeaderboard).mockResolvedValue([
            {
                rank: 1,
                userId: "user_test_1",
                name: "Jan Kowalski",
                exactScoreBets: 1,
                correctOutcomeBets: 0,
                totalPoints: 3,
            },
        ]);

        const result = await callTool("get_leaderboard", {
            tournamentId: "t1",
        });
        const parsed = JSON.parse(result.content[0].text) as {
            leaderboard: {
                rank: number;
                name: string;
                totalPoints: number;
            }[];
        };

        expect(parsed.leaderboard).toEqual([
            {
                rank: 1,
                userId: "user_test_1",
                name: "Jan Kowalski",
                exactScoreBets: 1,
                correctOutcomeBets: 0,
                totalPoints: 3,
            },
        ]);
    });
});
