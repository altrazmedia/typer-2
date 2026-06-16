import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TournamentDetailsPage } from "@/features/tournament/pages/tournament-details-page";
import { getTournamentMembership } from "@/features/tournament/server/get-tournament-membership";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";

vi.mock("@/features/tournament/server/get-tournament-membership", () => ({
    getTournamentMembership: vi.fn(),
}));

vi.mock("@/features/tournament/components/tournament-header", () => ({
    TournamentHeader: () => <div data-testid="tournament-header" />,
    TournamentHeaderLoading: () => null,
}));

vi.mock(
    "@/features/tournament/components/tournament-upcoming-games-section",
    () => ({
        TournamentUpcomingGamesSection: () => (
            <div data-testid="tournament-upcoming-games-section" />
        ),
        TournamentUpcomingGamesSectionLoading: () => null,
    }),
);

vi.mock(
    "@/features/tournament/components/tournament-finished-games-section",
    () => ({
        TournamentFinishedGamesSection: () => (
            <div data-testid="tournament-finished-games-section" />
        ),
        TournamentFinishedGamesSectionLoading: () => null,
    }),
);

vi.mock(
    "@/features/tournament/components/tournament-leaderboard-section",
    () => ({
        TournamentLeaderboardSection: () => (
            <div data-testid="tournament-leaderboard-section" />
        ),
        TournamentLeaderboardSectionLoading: () => null,
    }),
);

vi.mock("@/components/ui/tab-navigation", () => ({
    TabNavigation: ({
        tabs,
        activeTab,
    }: {
        activeTab: string;
        tabs: { label: string; value: string }[];
    }) => (
        <nav data-testid="tab-navigation" data-active-tab={activeTab}>
            {tabs.map((t) => (
                <span key={t.value}>{t.label}</span>
            ))}
        </nav>
    ),
}));

describe("TournamentDetailsPage", () => {
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
            TournamentDetailsPage({
                params: Promise.resolve({ id: "t1" }),
                searchParams: Promise.resolve({}),
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
            TournamentDetailsPage({
                params: Promise.resolve({ id: "missing" }),
                searchParams: Promise.resolve({}),
            }),
        ).rejects.toThrow("notFound");
    });

    it("calls notFound when the tournament does not exist", async () => {
        const { notFound } = await import("next/navigation");
        mockAuthedUser({ id: "user_1" });
        vi.mocked(getTournamentMembership).mockResolvedValue(null);
        vi.mocked(notFound).mockImplementation(() => {
            throw new Error("notFound");
        });

        await expect(
            TournamentDetailsPage({
                params: Promise.resolve({ id: "missing" }),
                searchParams: Promise.resolve({}),
            }),
        ).rejects.toThrow("notFound");

        expect(getTournamentMembership).toHaveBeenCalledWith(
            "missing",
            "user_1",
        );
    });

    it("renders tab navigation immediately on the default tab", async () => {
        mockAuthedUser({ id: "user_1" });

        render(
            await TournamentDetailsPage({
                params: Promise.resolve({ id: "t1" }),
                searchParams: Promise.resolve({}),
            }),
        );

        expect(screen.getByTestId("tab-navigation")).toHaveAttribute(
            "data-active-tab",
            "upcoming",
        );
        expect(screen.getByText("Nadchodzące mecze")).toBeInTheDocument();
        expect(screen.getByText("Zakończone mecze")).toBeInTheDocument();
        expect(screen.getByText("Tabela")).toBeInTheDocument();
        expect(
            screen.getByTestId("tournament-upcoming-games-section"),
        ).toBeInTheDocument();
    });

    it("renders leaderboard section when ?tab=leaderboard", async () => {
        mockAuthedUser({ id: "user_1" });

        render(
            await TournamentDetailsPage({
                params: Promise.resolve({ id: "t1" }),
                searchParams: Promise.resolve({ tab: "leaderboard" }),
            }),
        );

        expect(screen.getByTestId("tab-navigation")).toHaveAttribute(
            "data-active-tab",
            "leaderboard",
        );
        expect(
            screen.getByTestId("tournament-leaderboard-section"),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId("tournament-upcoming-games-section"),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId("tournament-finished-games-section"),
        ).not.toBeInTheDocument();
    });

    it("passes isAdmin from membership to header", async () => {
        mockAuthedUser({ id: "user_1" });
        vi.mocked(getTournamentMembership).mockResolvedValue({ isAdmin: true });

        render(
            await TournamentDetailsPage({
                params: Promise.resolve({ id: "t1" }),
                searchParams: Promise.resolve({}),
            }),
        );

        expect(getTournamentMembership).toHaveBeenCalledWith("t1", "user_1");
        expect(screen.getByTestId("tournament-header")).toBeInTheDocument();
    });
});
