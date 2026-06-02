import { describe, expect, it, vi } from "vitest";

import { getLeaderboard } from "@/features/tournament/api/get-leaderboard";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeGroupMember, makeTournament } from "@/test/factories";
import { prisma } from "@/test/prisma";
import { readJson } from "@/test/response";

vi.mock("@/features/tournament/server/get-tournament-leaderboard", () => ({
    getTournamentLeaderboard: vi.fn(),
}));

import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";

const tournamentId = "tournament_test_1";

function makeRouteContext(id = tournamentId) {
    return { params: Promise.resolve({ id }) };
}

describe("getLeaderboard", () => {
    it("returns 401 when unauthenticated", async () => {
        mockUnauthed();
        const req = new Request(
            `http://test.local/api/tournaments/${tournamentId}/leaderboard`,
        );
        const res = await getLeaderboard(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(401);
        expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
    });

    it("returns 404 when tournament not found", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.tournament.findUnique.mockResolvedValue(null);
        const req = new Request(
            `http://test.local/api/tournaments/${tournamentId}/leaderboard`,
        );
        const res = await getLeaderboard(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(404);
        expect(body).toEqual({ error: "Turniej nie został znaleziony." });
    });

    it("returns 403 when user is not a group member", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({ id: tournamentId }),
        );
        prisma.groupMember.findFirst.mockResolvedValue(null);
        const req = new Request(
            `http://test.local/api/tournaments/${tournamentId}/leaderboard`,
        );
        const res = await getLeaderboard(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(403);
        expect(body).toEqual({ error: "Brak dostępu do tej grupy." });
    });

    it("returns 200 with leaderboard for group member", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({ id: tournamentId, groupId: "group_test_1" }),
        );
        prisma.groupMember.findFirst.mockResolvedValue(
            makeGroupMember({ userId: "u1", groupId: "group_test_1" }),
        );

        const leaderboard = [
            {
                rank: 1,
                userId: "u1",
                name: "Alice",
                exactScoreBets: 2,
                correctOutcomeBets: 1,
                totalPoints: 7,
            },
        ];
        vi.mocked(getTournamentLeaderboard).mockResolvedValue(leaderboard);

        const req = new Request(
            `http://test.local/api/tournaments/${tournamentId}/leaderboard`,
        );
        const res = await getLeaderboard(req, makeRouteContext());
        const { status, body } = await readJson(res);

        expect(status).toBe(200);
        expect(body).toEqual(leaderboard);
        expect(getTournamentLeaderboard).toHaveBeenCalledWith(tournamentId);
    });
});
