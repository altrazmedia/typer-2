import { BetResult } from "@prisma/client";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FinishedGameBetsToggle } from "@/features/game/components/finished-game-bets-toggle";
import type { GameBetTableRow } from "@/features/game/types";

const rows: GameBetTableRow[] = [
    {
        userId: "u1",
        name: "Jan Kowalski",
        isCurrentUser: true,
        homeScore: 2,
        awayScore: 1,
        betResult: null,
    },
    {
        userId: "u2",
        name: "Anna Nowak",
        isCurrentUser: false,
        homeScore: null,
        awayScore: null,
        betResult: null,
    },
];

const resultRows: GameBetTableRow[] = [
    {
        userId: "u1",
        name: "Jan Kowalski",
        isCurrentUser: true,
        homeScore: 2,
        awayScore: 1,
        betResult: BetResult.EXACT_SCORE,
    },
    {
        userId: "u2",
        name: "Anna Nowak",
        isCurrentUser: false,
        homeScore: 1,
        awayScore: 1,
        betResult: BetResult.CORRECT_OUTCOME,
    },
    {
        userId: "u3",
        name: "Łukasz Zieliński",
        isCurrentUser: false,
        homeScore: 0,
        awayScore: 2,
        betResult: BetResult.INCORRECT,
    },
    {
        userId: "u4",
        name: "Beata Adamska",
        isCurrentUser: false,
        homeScore: 3,
        awayScore: 0,
        betResult: null,
    },
    {
        userId: "u5",
        name: "Piotr Wiśniewski",
        isCurrentUser: false,
        homeScore: null,
        awayScore: null,
        betResult: null,
    },
];

async function expandSection() {
    const user = userEvent.setup();
    render(<FinishedGameBetsToggle rows={resultRows} />);
    await user.click(screen.getByRole("button", { name: "Pokaż typy" }));
    return user;
}

describe("FinishedGameBetsToggle", () => {
    it("is collapsed by default and shows the expand label", () => {
        render(<FinishedGameBetsToggle rows={rows} />);

        expect(
            screen.getByRole("button", { name: "Pokaż typy" }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Jan Kowalski")).not.toBeInTheDocument();
        expect(screen.queryByText("Anna Nowak")).not.toBeInTheDocument();
    });

    it("expands to show rows and collapses again on toggle", async () => {
        const user = userEvent.setup();
        render(<FinishedGameBetsToggle rows={rows} />);

        await user.click(screen.getByRole("button", { name: "Pokaż typy" }));

        expect(
            screen.getByRole("button", { name: "Ukryj typy" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
        expect(screen.getByText("Anna Nowak")).toBeInTheDocument();
        expect(screen.getByText("2 - 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Ukryj typy" }));

        expect(
            screen.getByRole("button", { name: "Pokaż typy" }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Jan Kowalski")).not.toBeInTheDocument();
    });

    it("shows bet result indicators with correct tooltips when expanded", async () => {
        await expandSection();

        expect(screen.getByTitle("Dokładny wynik")).toBeInTheDocument();
        expect(screen.getByTitle("Poprawny rezultat")).toBeInTheDocument();
        expect(screen.getByTitle("Niepoprawny typ")).toBeInTheDocument();
        expect(
            screen.getByTitle("Oczekuje na wynik meczu"),
        ).toBeInTheDocument();
    });

    it("does not show a result indicator when the member did not bet", async () => {
        await expandSection();

        const indicators = screen.getAllByRole("img");
        expect(indicators).toHaveLength(4);
        expect(screen.queryByText("Piotr Wiśniewski")).toBeInTheDocument();
    });
});
