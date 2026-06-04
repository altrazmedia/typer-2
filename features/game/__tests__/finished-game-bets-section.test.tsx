import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FinishedGameBetsSection } from "@/features/game/components/finished-game-bets-section";
import type { GameBetTableRow } from "@/features/game/types";

const rows: GameBetTableRow[] = [
    {
        userId: "u1",
        name: "Jan Kowalski",
        isCurrentUser: true,
        homeScore: 2,
        awayScore: 1,
    },
    {
        userId: "u2",
        name: "Anna Nowak",
        isCurrentUser: false,
        homeScore: null,
        awayScore: null,
    },
];

describe("FinishedGameBetsSection", () => {
    it("is collapsed by default and shows the expand label", () => {
        render(<FinishedGameBetsSection rows={rows} />);

        expect(
            screen.getByRole("button", { name: "Pokaż typowania" }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Jan Kowalski")).not.toBeInTheDocument();
        expect(screen.queryByText("Anna Nowak")).not.toBeInTheDocument();
    });

    it("expands to show rows and collapses again on toggle", async () => {
        const user = userEvent.setup();
        render(<FinishedGameBetsSection rows={rows} />);

        await user.click(
            screen.getByRole("button", { name: "Pokaż typowania" }),
        );

        expect(
            screen.getByRole("button", { name: "Ukryj typowania" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
        expect(screen.getByText("Anna Nowak")).toBeInTheDocument();
        expect(screen.getByText("2 - 1")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Ukryj typowania" }),
        );

        expect(
            screen.getByRole("button", { name: "Pokaż typowania" }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Jan Kowalski")).not.toBeInTheDocument();
    });
});
