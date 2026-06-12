import { describe, expect, it } from "vitest";

import { createGame } from "@/features/game/server/create-game";
import { makeGame } from "@/test/factories";
import { prisma } from "@/test/prisma";

describe("createGame", () => {
    it("creates a game with validated data", async () => {
        const kickoffAt = "2026-07-01T20:00:00.000Z";
        const kickoffAtDate = new Date("2026-07-01T20:00:00.000Z");
        const created = makeGame({
            id: "new_game",
            homeTeam: "A",
            awayTeam: "B",
            kickoffAt: kickoffAtDate,
        });
        prisma.game.create.mockResolvedValue(created);

        const result = await createGame({
            tournamentId: "tournament_test_1",
            homeTeam: "A",
            awayTeam: "B",
            kickoffAt,
        });

        expect(result).toEqual(created);
        expect(prisma.game.create).toHaveBeenCalledWith({
            data: {
                tournamentId: "tournament_test_1",
                homeTeam: "A",
                awayTeam: "B",
                kickoffAt: kickoffAtDate,
            },
        });
    });

    it("throws when tournamentId is empty", async () => {
        await expect(
            createGame({
                tournamentId: "  ",
                homeTeam: "A",
                awayTeam: "B",
                kickoffAt: "2026-07-01T20:00:00.000Z",
            }),
        ).rejects.toThrow("Identyfikator turnieju jest wymagany.");
    });

    it("throws when homeTeam is empty", async () => {
        await expect(
            createGame({
                tournamentId: "tournament_test_1",
                homeTeam: "  ",
                awayTeam: "B",
                kickoffAt: "2026-07-01T20:00:00.000Z",
            }),
        ).rejects.toThrow("Drużyna gospodarzy jest wymagana.");
    });

    it("throws when awayTeam is empty", async () => {
        await expect(
            createGame({
                tournamentId: "tournament_test_1",
                homeTeam: "A",
                awayTeam: "  ",
                kickoffAt: "2026-07-01T20:00:00.000Z",
            }),
        ).rejects.toThrow("Drużyna gości jest wymagana.");
    });
});
