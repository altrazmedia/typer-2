import { BetResult } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { submitGameResult } from "@/features/game/api/submit-result";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import {
    makeBet,
    makeGame,
    makeGroupMember,
    makeTournament,
} from "@/test/factories";
import { prisma } from "@/test/prisma";
import { makeInvalidJsonRequest, makeJsonRequest } from "@/test/request";
import { readJson } from "@/test/response";

import { getCacheTag } from "@/lib/cache-tags";
import { revalidateTag } from "next/cache";

const gameId = "game_test_1";

function makeRouteContext(id = gameId) {
    return { params: Promise.resolve({ id }) };
}

function mockTransaction() {
    prisma.$transaction.mockImplementation(async (callback) =>
        callback(prisma as unknown as Prisma.TransactionClient),
    );
}

function mockAdminAccess() {
    prisma.game.findUnique.mockResolvedValueOnce(makeGame({ id: gameId }));
    prisma.tournament.findUnique.mockResolvedValue(makeTournament());
    prisma.groupMember.findFirst.mockResolvedValue(
        makeGroupMember({ isAdmin: true }),
    );
}

function mockGameWithBets(
    homeScore: number,
    awayScore: number,
    bets: ReturnType<typeof makeBet>[],
) {
    return {
        ...makeGame({ id: gameId, homeScore, awayScore }),
        tournament: makeTournament({
            exactScorePoints: 3,
            correctOutcomePoints: 1,
        }),
        bets,
    };
}

describe("submitGameResult", () => {
    it("returns 401 when unauthenticated", async () => {
        mockUnauthed();
        const req = makeJsonRequest({ homeScore: 1, awayScore: 0 });
        const res = await submitGameResult(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(401);
        expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
    });

    it("returns 404 when game not found", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.game.findUnique.mockResolvedValue(null);
        const req = makeJsonRequest({ homeScore: 1, awayScore: 0 });
        const res = await submitGameResult(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(404);
        expect(body).toEqual({ error: "Mecz nie został znaleziony." });
    });

    it("returns 403 when user is not tournament admin", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.game.findUnique.mockResolvedValue(makeGame({ id: gameId }));
        prisma.tournament.findUnique.mockResolvedValue(makeTournament());
        prisma.groupMember.findFirst.mockResolvedValue(null);
        const req = makeJsonRequest({ homeScore: 1, awayScore: 0 });
        const res = await submitGameResult(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(403);
        expect(body).toEqual({
            error: "Brak uprawnień administratora tej grupy.",
        });
    });

    it("returns 400 when JSON is invalid", async () => {
        mockAuthedUser({ id: "u1" });
        mockAdminAccess();
        const res = await submitGameResult(
            makeInvalidJsonRequest(),
            makeRouteContext(),
        );
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toEqual({ error: "Nieprawidłowy format żądania." });
    });

    it("returns 400 when body fails validation", async () => {
        mockAuthedUser({ id: "u1" });
        mockAdminAccess();
        const req = makeJsonRequest({ homeScore: -1, awayScore: 0 });
        const res = await submitGameResult(req, makeRouteContext());
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toEqual({
            error: "Podaj prawidłowy wynik (liczby całkowite ≥ 0).",
        });
    });

    it("returns 200 and awards bet results for all bets when admin submits result", async () => {
        mockAuthedUser({ id: "u1" });
        mockAdminAccess();
        mockTransaction();

        const updatedGame = makeGame({
            id: gameId,
            homeScore: 2,
            awayScore: 1,
        });
        prisma.game.update.mockResolvedValue(updatedGame);
        prisma.game.findUnique.mockResolvedValueOnce(
            mockGameWithBets(2, 1, [
                makeBet({ id: "bet_exact", homeScore: 2, awayScore: 1 }),
                makeBet({ id: "bet_outcome", homeScore: 3, awayScore: 0 }),
                makeBet({ id: "bet_wrong", homeScore: 0, awayScore: 2 }),
            ]),
        );

        const req = makeJsonRequest({ homeScore: 2, awayScore: 1 });
        const res = await submitGameResult(req, makeRouteContext());
        const { status, body } = await readJson(res);

        expect(status).toBe(200);
        expect(body).toEqual(JSON.parse(JSON.stringify({ game: updatedGame })));
        expect(prisma.game.update).toHaveBeenCalledWith({
            where: { id: gameId },
            data: { homeScore: 2, awayScore: 1 },
        });
        expect(prisma.bet.update).toHaveBeenCalledTimes(3);
        expect(prisma.bet.update).toHaveBeenCalledWith({
            where: { id: "bet_exact" },
            data: { betResult: BetResult.EXACT_SCORE },
        });
        expect(prisma.bet.update).toHaveBeenCalledWith({
            where: { id: "bet_outcome" },
            data: { betResult: BetResult.CORRECT_OUTCOME },
        });
        expect(prisma.bet.update).toHaveBeenCalledWith({
            where: { id: "bet_wrong" },
            data: { betResult: BetResult.INCORRECT },
        });
        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("leaderboard", { tournamentId: "tournament_test_1" }),
            "max",
        );
    });

    it("recalculates bet results when admin re-submits a different score", async () => {
        mockAuthedUser({ id: "u1" });
        mockTransaction();

        const firstUpdatedGame = makeGame({
            id: gameId,
            homeScore: 2,
            awayScore: 1,
        });
        const secondUpdatedGame = makeGame({
            id: gameId,
            homeScore: 0,
            awayScore: 0,
        });

        prisma.game.findUnique
            .mockResolvedValueOnce(makeGame({ id: gameId }))
            .mockResolvedValueOnce(
                mockGameWithBets(2, 1, [
                    makeBet({ id: "bet_1", homeScore: 2, awayScore: 1 }),
                ]),
            )
            .mockResolvedValueOnce(makeGame({ id: gameId }))
            .mockResolvedValueOnce(
                mockGameWithBets(0, 0, [
                    makeBet({ id: "bet_1", homeScore: 2, awayScore: 1 }),
                ]),
            );
        prisma.tournament.findUnique.mockResolvedValue(makeTournament());
        prisma.groupMember.findFirst.mockResolvedValue(
            makeGroupMember({ isAdmin: true }),
        );
        prisma.game.update
            .mockResolvedValueOnce(firstUpdatedGame)
            .mockResolvedValueOnce(secondUpdatedGame);

        const firstReq = makeJsonRequest({ homeScore: 2, awayScore: 1 });
        await submitGameResult(firstReq, makeRouteContext());
        expect(prisma.bet.update).toHaveBeenCalledWith({
            where: { id: "bet_1" },
            data: { betResult: BetResult.EXACT_SCORE },
        });

        const secondReq = makeJsonRequest({ homeScore: 0, awayScore: 0 });
        const res = await submitGameResult(secondReq, makeRouteContext());
        const { status } = await readJson(res);

        expect(status).toBe(200);
        expect(prisma.bet.update).toHaveBeenLastCalledWith({
            where: { id: "bet_1" },
            data: { betResult: BetResult.INCORRECT },
        });
    });

    it("returns 200 and updates game when there are zero bets", async () => {
        mockAuthedUser({ id: "u1" });
        mockAdminAccess();
        mockTransaction();

        const updatedGame = makeGame({
            id: gameId,
            homeScore: 1,
            awayScore: 1,
        });
        prisma.game.update.mockResolvedValue(updatedGame);
        prisma.game.findUnique.mockResolvedValueOnce(
            mockGameWithBets(1, 1, []),
        );

        const req = makeJsonRequest({ homeScore: 1, awayScore: 1 });
        const res = await submitGameResult(req, makeRouteContext());
        const { status, body } = await readJson(res);

        expect(status).toBe(200);
        expect(body).toEqual(JSON.parse(JSON.stringify({ game: updatedGame })));
        expect(prisma.bet.update).not.toHaveBeenCalled();
    });
});
