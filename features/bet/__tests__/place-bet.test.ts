import { describe, expect, it } from "vitest";

import { placeBet } from "@/features/bet/api/place-bet";
import { mockApiKeyAuth, mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeBet, makeGame } from "@/test/factories";
import { prisma } from "@/test/prisma";
import { makeJsonRequest } from "@/test/request";
import { readJson } from "@/test/response";

describe("placeBet", () => {
    it("returns 401 when unauthenticated", async () => {
        mockUnauthed();
        prisma.apiKey.findUnique.mockResolvedValue(null);
        const req = makeJsonRequest({
            gameId: "g1",
            homeScore: 1,
            awayScore: 0,
        });
        const res = await placeBet(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(401);
        expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
    });

    it("returns 400 when body fails validation", async () => {
        mockAuthedUser({ id: "u1" });
        const req = makeJsonRequest({
            homeScore: 0,
            awayScore: 0,
        });
        const res = await placeBet(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toEqual({ error: "Podaj prawidłowe dane zakładu." });
    });

    it("returns 404 when game not found", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.game.findUnique.mockResolvedValue(null);
        const req = makeJsonRequest({
            gameId: "missing",
            homeScore: 0,
            awayScore: 0,
        });
        const res = await placeBet(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(404);
        expect(body).toEqual({ error: "Mecz nie został znaleziony." });
    });

    it("returns 400 when kickoff is in the past", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.game.findUnique.mockResolvedValue(
            makeGame({
                id: "g_past",
                kickoffAt: new Date("2020-01-01T12:00:00.000Z"),
            }),
        );
        const req = makeJsonRequest({
            gameId: "g_past",
            homeScore: 2,
            awayScore: 1,
        });
        const res = await placeBet(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toEqual({
            error: "Nie można obstawiać meczu po rozpoczęciu.",
        });
    });

    it("returns 200 and upserts bet for upcoming game", async () => {
        mockAuthedUser({ id: "u1" });
        const futureKickoff = new Date(Date.now() + 3_600_000);
        prisma.game.findUnique.mockResolvedValue(
            makeGame({ id: "g_upcoming", kickoffAt: futureKickoff }),
        );
        const upserted = makeBet({
            id: "bet_new",
            gameId: "g_upcoming",
            userId: "u1",
            homeScore: 2,
            awayScore: 1,
        });
        prisma.bet.upsert.mockResolvedValue(upserted);

        const req = makeJsonRequest({
            gameId: "g_upcoming",
            homeScore: 2,
            awayScore: 1,
        });
        const res = await placeBet(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(200);
        expect(body).toEqual({ homeScore: 2, awayScore: 1 });

        expect(prisma.bet.upsert).toHaveBeenCalledWith({
            where: {
                gameId_userId: { gameId: "g_upcoming", userId: "u1" },
            },
            create: {
                gameId: "g_upcoming",
                userId: "u1",
                homeScore: 2,
                awayScore: 1,
            },
            update: {
                homeScore: 2,
                awayScore: 1,
            },
        });
    });

    it("returns 200 when updating existing bet", async () => {
        mockAuthedUser({ id: "u1" });
        const futureKickoff = new Date(Date.now() + 3_600_000);
        prisma.game.findUnique.mockResolvedValue(
            makeGame({ id: "g_same", kickoffAt: futureKickoff }),
        );
        prisma.bet.upsert.mockResolvedValue(
            makeBet({
                id: "bet_existing",
                gameId: "g_same",
                userId: "u1",
                homeScore: 3,
                awayScore: 2,
            }),
        );

        const req = makeJsonRequest({
            gameId: "g_same",
            homeScore: 3,
            awayScore: 2,
        });
        const res = await placeBet(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(200);
        expect(body).toEqual({ homeScore: 3, awayScore: 2 });

        expect(prisma.bet.upsert).toHaveBeenCalledWith({
            where: {
                gameId_userId: { gameId: "g_same", userId: "u1" },
            },
            create: {
                gameId: "g_same",
                userId: "u1",
                homeScore: 3,
                awayScore: 2,
            },
            update: {
                homeScore: 3,
                awayScore: 2,
            },
        });
    });

    it("returns 200 when authenticated via API key", async () => {
        const rawKey = mockApiKeyAuth({ id: "u1" });
        const futureKickoff = new Date(Date.now() + 3_600_000);
        prisma.game.findUnique.mockResolvedValue(
            makeGame({ id: "g_api", kickoffAt: futureKickoff }),
        );
        prisma.bet.upsert.mockResolvedValue(
            makeBet({
                id: "bet_api",
                gameId: "g_api",
                userId: "u1",
                homeScore: 1,
                awayScore: 0,
            }),
        );

        const req = makeJsonRequest(
            {
                gameId: "g_api",
                homeScore: 1,
                awayScore: 0,
            },
            { headers: { "X-API-Key": rawKey } },
        );
        const res = await placeBet(req);
        const { status, body } = await readJson(res);

        expect(status).toBe(200);
        expect(body).toEqual({ homeScore: 1, awayScore: 0 });
    });
});
