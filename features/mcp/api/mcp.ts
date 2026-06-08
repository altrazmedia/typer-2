import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

import { placeBetForUser } from "@/features/bet/server/place-bet";
import { verifyToken } from "@/features/oauth/server/jwt";
import { getTournamentDetailForUser } from "@/features/tournament/server/get-tournament-detail";
import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";
import { prisma } from "@/lib/db";

const RESOURCE_METADATA_URL = "/.well-known/oauth-protected-resource";

const scoreSchema = z
    .number()
    .int()
    .min(0)
    .max(10)
    .describe("Liczba goli (0–10)");

function unauthorizedResponse(): Response {
    return new Response(
        JSON.stringify({ error: "Wymagane uwierzytelnienie." }),
        {
            status: 401,
            headers: {
                "Content-Type": "application/json",
                "WWW-Authenticate": `Bearer resource_metadata="${RESOURCE_METADATA_URL}"`,
            },
        },
    );
}

function toolJson(data: unknown) {
    return {
        content: [
            {
                type: "text" as const,
                text: JSON.stringify(data),
            },
        ],
    };
}

function toolError(message: string) {
    return {
        content: [
            {
                type: "text" as const,
                text: message,
            },
        ],
        isError: true,
    };
}

function isFinishedGame(game: {
    homeScore: number | null;
    awayScore: number | null;
}) {
    return game.homeScore !== null && game.awayScore !== null;
}

function registerTools(server: McpServer, userId: string) {
    server.tool(
        "whoami",
        "Zwraca informacje o aktualnie uwierzytelnionym użytkowniku.",
        {},
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true },
            });
            if (!user) {
                return toolError("Użytkownik nie został znaleziony.");
            }
            return toolJson({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        },
    );

    server.tool(
        "list_my_tournaments",
        "Zwraca listę turniejów, w których użytkownik uczestniczy, pogrupowanych według grup.",
        {},
        async () => {
            const sections = await listTournamentsForUser(userId);
            return toolJson({ groups: sections });
        },
    );

    server.tool(
        "list_upcoming_games",
        "Zwraca nadchodzące (nierozegrane) mecze w turnieju wraz z zakładem użytkownika.",
        {
            tournamentId: z.string().describe("Identyfikator turnieju"),
        },
        async ({ tournamentId }) => {
            const detail = await getTournamentDetailForUser(
                tournamentId,
                userId,
            );
            if (!detail) {
                return toolError(
                    "Turniej nie został znaleziony lub brak dostępu.",
                );
            }

            const games = detail.tournament.games
                .filter((game) => !isFinishedGame(game))
                .map((game) => {
                    const myBet = game.bets.find(
                        (bet) => bet.userId === userId,
                    );
                    return {
                        id: game.id,
                        homeTeam: game.homeTeam,
                        awayTeam: game.awayTeam,
                        kickoffAt: game.kickoffAt.toISOString(),
                        myBet: myBet
                            ? {
                                  homeScore: myBet.homeScore,
                                  awayScore: myBet.awayScore,
                              }
                            : null,
                    };
                });

            return toolJson({ games });
        },
    );

    server.tool(
        "list_finished_games",
        "Zwraca zakończone mecze w turnieju wraz z wynikami i zakładami wszystkich graczy.",
        {
            tournamentId: z.string().describe("Identyfikator turnieju"),
        },
        async ({ tournamentId }) => {
            const detail = await getTournamentDetailForUser(
                tournamentId,
                userId,
            );
            if (!detail) {
                return toolError(
                    "Turniej nie został znaleziony lub brak dostępu.",
                );
            }

            const memberNames = new Map(
                detail.groupMembers.map((member) => [
                    member.userId,
                    member.name,
                ]),
            );

            const games = detail.tournament.games
                .filter((game) => isFinishedGame(game))
                .map((game) => ({
                    id: game.id,
                    homeTeam: game.homeTeam,
                    awayTeam: game.awayTeam,
                    kickoffAt: game.kickoffAt.toISOString(),
                    homeScore: game.homeScore,
                    awayScore: game.awayScore,
                    bets: game.bets.map((bet) => ({
                        name: memberNames.get(bet.userId) ?? "Nieznany",
                        homeScore: bet.homeScore,
                        awayScore: bet.awayScore,
                        betResult: bet.betResult,
                    })),
                }));

            return toolJson({ games });
        },
    );

    server.tool(
        "place_bet",
        "Składa lub aktualizuje zakład użytkownika na mecz przed jego rozpoczęciem.",
        {
            gameId: z.string().describe("Identyfikator meczu"),
            homeScore: scoreSchema,
            awayScore: scoreSchema,
        },
        async ({ gameId, homeScore, awayScore }) => {
            const result = await placeBetForUser(
                userId,
                gameId,
                homeScore,
                awayScore,
            );

            if (!result.ok) {
                return toolError(result.error);
            }

            return toolJson({
                homeScore: result.homeScore,
                awayScore: result.awayScore,
            });
        },
    );

    server.tool(
        "get_leaderboard",
        "Zwraca tabelę wyników turnieju.",
        {
            tournamentId: z.string().describe("Identyfikator turnieju"),
        },
        async ({ tournamentId }) => {
            const detail = await getTournamentDetailForUser(
                tournamentId,
                userId,
            );
            if (!detail) {
                return toolError(
                    "Turniej nie został znaleziony lub brak dostępu.",
                );
            }

            const leaderboard = await getTournamentLeaderboard(tournamentId);
            if (!leaderboard) {
                return toolError("Turniej nie został znaleziony.");
            }

            return toolJson({ leaderboard });
        },
    );
}

export async function handleMcpRequest(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204 });
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
        return unauthorizedResponse();
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return unauthorizedResponse();
    }

    const userId = payload.sub;

    const server = new McpServer({
        name: "typer-2",
        version: "1.0.0",
    });

    registerTools(server, userId);

    const transport = new WebStandardStreamableHTTPServerTransport({
        enableJsonResponse: true,
    });

    await server.connect(transport);
    return transport.handleRequest(request);
}
