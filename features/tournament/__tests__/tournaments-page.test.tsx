import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TournamentsPage } from "@/features/tournament/pages/tournaments-page";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";

vi.mock("@/features/tournament/components/tournaments-overview", () => ({
    TournamentsOverview: ({ userId }: { userId: string }) => (
        <div data-testid="tournaments-overview" data-user-id={userId} />
    ),
    TournamentsOverviewLoading: () => null,
}));

describe("TournamentsPage", () => {
    it("redirects to login when the user is not authenticated", async () => {
        const { redirect } = await import("next/navigation");
        mockUnauthed();
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("redirect");
        });

        await expect(TournamentsPage()).rejects.toThrow("redirect");

        expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("renders the page header and passes userId to the overview", async () => {
        mockAuthedUser({ id: "user_1" });

        render(await TournamentsPage());

        expect(screen.getByText("Turnieje")).toBeInTheDocument();
        expect(screen.getByTestId("tournaments-overview")).toHaveAttribute(
            "data-user-id",
            "user_1",
        );
    });
});
