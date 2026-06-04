import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BetForm } from "@/features/bet/components/bet-form";

import * as toast from "@/lib/toast";
import { mockRouter } from "@/test/router";

vi.mock("@/lib/toast", () => ({
    showErrorToast: vi.fn(),
}));

describe("BetForm", () => {
    let user: ReturnType<typeof userEvent.setup>;
    let fetchSpy!: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        user = userEvent.setup();
        fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ homeScore: 2, awayScore: 5 }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
        );
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it("shows a placeholder score when there is no saved bet", () => {
        render(
            <BetForm
                gameId="g1"
                homeTeam="Dom"
                awayTeam="Goście"
                userBet={null}
            />,
        );
        expect(
            screen.getByRole("button", { name: /Twój typ: \? - \?/ }),
        ).toHaveTextContent("? - ?");
    });

    it("shows the saved bet scores on the trigger", () => {
        render(
            <BetForm
                gameId="g1"
                homeTeam="Dom"
                awayTeam="Goście"
                userBet={{ homeScore: 1, awayScore: 2 }}
            />,
        );
        expect(
            screen.getByRole("button", { name: /Twój typ: 1 - 2/ }),
        ).toHaveTextContent("1 - 2");
    });

    it("saves when the popover is closed after both scores are chosen", async () => {
        render(
            <BetForm
                gameId="g1"
                homeTeam="Dom"
                awayTeam="Goście"
                userBet={null}
            />,
        );

        const trigger = screen.getByRole("button", { name: /Twój typ/ });
        await user.click(trigger);

        expect(screen.getByText("Dom")).toBeInTheDocument();
        expect(screen.getByText("Goście")).toBeInTheDocument();

        const twos = screen.getAllByRole("button", { name: /^2$/ });
        await user.click(twos[0]);

        const fives = screen.getAllByRole("button", { name: /^5$/ });
        await user.click(fives[1]);

        await user.click(trigger);

        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/bets",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }),
        );
        const [, init] = fetchSpy.mock.calls[0];
        const bodyInit = init as RequestInit | undefined;
        expect(bodyInit?.body).toBe(
            JSON.stringify({ gameId: "g1", homeScore: 2, awayScore: 5 }),
        );
        expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it("shows a toast when saving fails after closing", async () => {
        fetchSpy.mockResolvedValueOnce(new Response(null, { status: 400 }));

        render(
            <BetForm
                gameId="g1"
                homeTeam="Dom"
                awayTeam="Goście"
                userBet={null}
            />,
        );

        const trigger = screen.getByRole("button", { name: /Twój typ/ });
        await user.click(trigger);

        const ones = screen.getAllByRole("button", { name: /^1$/ });
        await user.click(ones[0]);
        const zeros = screen.getAllByRole("button", { name: /^0$/ });
        await user.click(zeros[1]);

        await user.click(trigger);

        await waitFor(() =>
            expect(toast.showErrorToast).toHaveBeenCalledWith(
                "Nie udało się zapisać zakładu.",
            ),
        );
    });
});
