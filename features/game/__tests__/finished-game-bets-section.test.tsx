import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FinishedGameBetsSection } from "@/features/game/components/finished-game-bets-section";
import { getGameBets } from "@/features/game/server/get-game-bets";

vi.mock("@/features/game/server/get-game-bets", () => ({
    getGameBets: vi.fn(),
}));

describe("FinishedGameBetsSection", () => {
    it("fetches bets and renders the toggle with built rows", async () => {
        vi.mocked(getGameBets).mockResolvedValue([
            {
                userId: "u1",
                homeScore: 2,
                awayScore: 1,
                betResult: null,
            },
        ]);

        render(
            await FinishedGameBetsSection({
                gameId: "game_1",
                groupMembers: [{ userId: "u1", name: "Jan Kowalski" }],
                currentUserId: "u1",
            }),
        );

        expect(getGameBets).toHaveBeenCalledWith("game_1");
        expect(
            screen.getByRole("button", { name: "Pokaż typy" }),
        ).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Pokaż typy" }));

        expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
        expect(screen.getByText("2 - 1")).toBeInTheDocument();
    });
});
