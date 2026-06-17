import { revalidateTag } from "next/cache";
import { describe, expect, it } from "vitest";

import { saveAdditionalBetEventAction } from "@/features/tournament/actions/save-additional-bet-event";
import { getCacheTag } from "@/lib/cache-tags";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import {
    makeAdditionalBetEvent,
    makeGroupMember,
    makeTournament,
} from "@/test/factories";
import { prisma } from "@/test/prisma";

const tournamentId = "tournament_test_1";
const futureDeadline = new Date(Date.now() + 86_400_000).toISOString();

function mockTournamentAdmin(userId: string): void {
    prisma.tournament.findUnique.mockResolvedValue(
        makeTournament({ id: tournamentId, groupId: "group_test_1" }),
    );
    prisma.groupMember.findFirst.mockResolvedValue(
        makeGroupMember({ userId, groupId: "group_test_1", isAdmin: true }),
    );
}

describe("saveAdditionalBetEventAction", () => {
    it("returns error when unauthenticated", async () => {
        mockUnauthed();

        const result = await saveAdditionalBetEventAction({
            tournamentId,
            name: "Who will win?",
            deadline: futureDeadline,
            points: 5,
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Wymagane uwierzytelnienie.",
        });
    });

    it("returns error when user is not a group admin", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({ id: tournamentId }),
        );
        prisma.groupMember.findFirst.mockResolvedValue(null);

        const result = await saveAdditionalBetEventAction({
            tournamentId,
            name: "Who will win?",
            deadline: futureDeadline,
            points: 5,
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Brak uprawnień administratora tej grupy.",
        });
    });

    it("creates a new event and revalidates additional-bet-events tag", async () => {
        mockAuthedUser({ id: "admin_1" });
        mockTournamentAdmin("admin_1");
        prisma.additionalBetEvent.create.mockResolvedValue(
            makeAdditionalBetEvent({ id: "abe_new" }),
        );

        const result = await saveAdditionalBetEventAction({
            tournamentId,
            name: "  Who will win?  ",
            deadline: futureDeadline,
            points: 5,
        });

        expect(result).toEqual({ isSuccess: true, data: { id: "abe_new" } });
        expect(prisma.additionalBetEvent.create).toHaveBeenCalledWith({
            data: {
                tournamentId,
                name: "Who will win?",
                deadline: new Date(futureDeadline),
                points: 5,
            },
        });
        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("additional-bet-events", { tournamentId }),
            "max",
        );
        expect(revalidateTag).not.toHaveBeenCalledWith(
            getCacheTag("leaderboard", { tournamentId }),
            "max",
        );
    });

    it("revalidates leaderboard when creating event with answer", async () => {
        mockAuthedUser({ id: "admin_1" });
        mockTournamentAdmin("admin_1");
        prisma.additionalBetEvent.create.mockResolvedValue(
            makeAdditionalBetEvent({ id: "abe_new", answer: "Poland" }),
        );

        await saveAdditionalBetEventAction({
            tournamentId,
            name: "Who will win?",
            deadline: futureDeadline,
            points: 5,
            answer: "Poland",
        });

        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("leaderboard", { tournamentId }),
            "max",
        );
    });

    it("updates an existing event without revalidating leaderboard when answer and points unchanged", async () => {
        mockAuthedUser({ id: "admin_1" });
        mockTournamentAdmin("admin_1");
        prisma.additionalBetEvent.findFirst.mockResolvedValue(
            makeAdditionalBetEvent({
                id: "abe_existing",
                answer: "Poland",
                points: 5,
            }),
        );
        prisma.additionalBetEvent.update.mockResolvedValue(
            makeAdditionalBetEvent({
                id: "abe_existing",
                name: "Updated name",
                answer: "Poland",
                points: 5,
            }),
        );

        const result = await saveAdditionalBetEventAction({
            tournamentId,
            id: "abe_existing",
            name: "Updated name",
            deadline: futureDeadline,
            points: 5,
            answer: "Poland",
        });

        expect(result).toEqual({
            isSuccess: true,
            data: { id: "abe_existing" },
        });
        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("additional-bet-events", { tournamentId }),
            "max",
        );
        expect(revalidateTag).not.toHaveBeenCalledWith(
            getCacheTag("leaderboard", { tournamentId }),
            "max",
        );
    });

    it("revalidates leaderboard when points are changed on update", async () => {
        mockAuthedUser({ id: "admin_1" });
        mockTournamentAdmin("admin_1");
        prisma.additionalBetEvent.findFirst.mockResolvedValue(
            makeAdditionalBetEvent({
                id: "abe_existing",
                answer: "Poland",
                points: 5,
            }),
        );
        prisma.additionalBetEvent.update.mockResolvedValue(
            makeAdditionalBetEvent({
                id: "abe_existing",
                answer: "Poland",
                points: 10,
            }),
        );

        await saveAdditionalBetEventAction({
            tournamentId,
            id: "abe_existing",
            name: "Who will win?",
            deadline: futureDeadline,
            points: 10,
            answer: "Poland",
        });

        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("leaderboard", { tournamentId }),
            "max",
        );
    });

    it("revalidates leaderboard when answer is changed on update", async () => {
        mockAuthedUser({ id: "admin_1" });
        mockTournamentAdmin("admin_1");
        prisma.additionalBetEvent.findFirst.mockResolvedValue(
            makeAdditionalBetEvent({
                id: "abe_existing",
                answer: "Poland",
            }),
        );
        prisma.additionalBetEvent.update.mockResolvedValue(
            makeAdditionalBetEvent({
                id: "abe_existing",
                answer: "Germany",
            }),
        );

        await saveAdditionalBetEventAction({
            tournamentId,
            id: "abe_existing",
            name: "Who will win?",
            deadline: futureDeadline,
            points: 5,
            answer: "Germany",
        });

        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("leaderboard", { tournamentId }),
            "max",
        );
    });

    it("returns error when updating a missing event", async () => {
        mockAuthedUser({ id: "admin_1" });
        mockTournamentAdmin("admin_1");
        prisma.additionalBetEvent.findFirst.mockResolvedValue(null);

        const result = await saveAdditionalBetEventAction({
            tournamentId,
            id: "missing",
            name: "Who will win?",
            deadline: futureDeadline,
            points: 5,
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Wydarzenie nie zostało znalezione.",
        });
    });
});
