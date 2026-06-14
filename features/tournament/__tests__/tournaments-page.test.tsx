import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TournamentsOverview } from "@/features/tournament/components/tournaments-overview";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";

vi.mock("@/features/tournament/server/list-tournaments-for-user", () => ({
    listTournamentsForUser: vi.fn(),
}));

vi.mock("@/features/tournament/components/create-tournament-dialog", () => ({
    CreateTournamentDialog: () => null,
}));

describe("TournamentsOverview", () => {
    it("redirects to login when the user is not authenticated", async () => {
        const { redirect } = await import("next/navigation");
        mockUnauthed();
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("redirect");
        });

        await expect(TournamentsOverview({})).rejects.toThrow("redirect");

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
                    },
                ],
            },
        ]);

        render(await TournamentsOverview({}));

        expect(screen.getByText("Liga 2026")).toBeInTheDocument();
        expect(screen.getByText("Grupa testowa")).toBeInTheDocument();
    });
});
