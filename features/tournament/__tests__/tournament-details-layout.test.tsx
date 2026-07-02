import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TournamentDetailsLayout } from "@/features/tournament/layout/tournament-details-layout";
import { getTournamentMembership } from "@/features/tournament/server/get-tournament-membership";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";

vi.mock("@/features/tournament/server/get-tournament-membership", () => ({
    getTournamentMembership: vi.fn(),
}));

vi.mock("@/features/tournament/components/tournament-header", () => ({
    TournamentHeader: () => <div data-testid="tournament-header" />,
    TournamentHeaderLoading: () => null,
}));

describe("TournamentDetailsLayout", () => {
    beforeEach(() => {
        vi.mocked(getTournamentMembership).mockResolvedValue({
            isAdmin: false,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("redirects to login when the user is not authenticated", async () => {
        const { redirect } = await import("next/navigation");
        mockUnauthed();
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("redirect");
        });

        await expect(
            TournamentDetailsLayout({
                params: Promise.resolve({ id: "t1" }),
                children: <div data-testid="layout-children" />,
            }),
        ).rejects.toThrow("redirect");

        expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("calls notFound when the user is not a group member", async () => {
        const { notFound } = await import("next/navigation");
        mockAuthedUser({ id: "user_1" });
        vi.mocked(getTournamentMembership).mockResolvedValue(null);
        vi.mocked(notFound).mockImplementation(() => {
            throw new Error("notFound");
        });

        await expect(
            TournamentDetailsLayout({
                params: Promise.resolve({ id: "missing" }),
                children: <div data-testid="layout-children" />,
            }),
        ).rejects.toThrow("notFound");
    });

    it("renders TournamentHeader and children for valid members", async () => {
        mockAuthedUser({ id: "user_1" });

        render(
            await TournamentDetailsLayout({
                params: Promise.resolve({ id: "t1" }),
                children: <div data-testid="layout-children" />,
            }),
        );

        expect(getTournamentMembership).toHaveBeenCalledWith("t1", "user_1");
        expect(screen.getByTestId("tournament-header")).toBeInTheDocument();
        expect(screen.getByTestId("layout-children")).toBeInTheDocument();
    });
});
