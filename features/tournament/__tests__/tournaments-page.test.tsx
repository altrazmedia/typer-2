import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TournamentsPageContent } from "@/features/tournament/pages/tournaments-page";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";

vi.mock("@/features/tournament/server/list-tournaments-for-user", () => ({
    listTournamentsForUser: vi.fn(),
}));

vi.mock("@/features/tournament/components/create-tournament-dialog", () => ({
    CreateTournamentDialog: () => null,
}));

describe("TournamentsPage", () => {
    it("redirects to login when the user is not authenticated", async () => {
        const { redirect } = await import("next/navigation");
        mockUnauthed();
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("redirect");
        });

        await expect(TournamentsPageContent()).rejects.toThrow("redirect");

        expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("renders tournament sections for authenticated user", async () => {
        mockAuthedUser({ id: "user_1" });
        vi.mocked(listTournamentsForUser).mockResolvedValue([
            {
                groupId: "group_1",
                groupName: "Grupa testowa",
                isAdmin: false,
                tournaments: [
                    {
                        id: "t1",
                        name: "Liga 2026",
                        season: "2025/26",
                        gameCount: 3,
                    },
                ],
            },
        ]);

        render(await TournamentsPageContent());

        expect(screen.getByText("Turnieje")).toBeInTheDocument();
        expect(screen.getByText("Liga 2026")).toBeInTheDocument();
        expect(screen.getByText("Grupa testowa")).toBeInTheDocument();
    });
});
