import { revalidateTag } from "next/cache";
import { describe, expect, it } from "vitest";

import { updateGame } from "@/features/game/server/update-game";
import { getCacheTag } from "@/lib/cache-tags";
import { makeGame } from "@/test/factories";
import { prisma } from "@/test/prisma";

describe("updateGame", () => {
    it("updates a game with partial data", async () => {
        const updated = makeGame({
            id: "game_test_1",
            homeTeam: "Updated Home",
        });
        prisma.game.update.mockResolvedValue(updated);

        const result = await updateGame({
            gameId: "game_test_1",
            homeTeam: "Updated Home",
        });

        expect(result).toEqual(updated);
        expect(prisma.game.update).toHaveBeenCalledWith({
            where: { id: "game_test_1" },
            data: { homeTeam: "Updated Home" },
        });
        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("tournament-games", {
                tournamentId: updated.tournamentId,
            }),
            "max",
        );
    });

    it("throws when no fields are provided", async () => {
        await expect(
            updateGame({
                gameId: "game_test_1",
            }),
        ).rejects.toThrow("Podaj co najmniej jedno pole do aktualizacji.");
    });
});
