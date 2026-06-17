import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TournamentsOverview } from "@/features/tournament/components/tournaments-overview";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";

vi.mock("@/features/tournament/server/list-tournaments-for-user", () => ({
    listTournamentsForUser: vi.fn(),
}));

vi.mock("@/features/tournament/components/create-tournament-dialog", () => ({
    CreateTournamentDialog: () => null,
}));

describe("TournamentsOverview", () => {
    it("renders tournament sections for the given user", async () => {
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

        render(await TournamentsOverview({ userId: "user_1" }));

        expect(listTournamentsForUser).toHaveBeenCalledWith("user_1");
        expect(screen.getByText("Liga 2026")).toBeInTheDocument();
        expect(screen.getByText("Grupa testowa")).toBeInTheDocument();
    });

    it("renders empty state when the user has no groups", async () => {
        vi.mocked(listTournamentsForUser).mockResolvedValue([]);

        render(await TournamentsOverview({ userId: "user_1" }));

        expect(
            screen.getByText(/Nie należysz jeszcze do żadnej grupy/),
        ).toBeInTheDocument();
    });
});
