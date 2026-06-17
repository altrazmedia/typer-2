import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAdditionalBetEvents } from "@/features/tournament/server/get-additional-bet-events";
import {
    makeAdditionalBet,
    makeAdditionalBetEvent,
    makeTournament,
    makeUser,
} from "@/test/factories";
import { prisma } from "@/test/prisma";

const tournamentId = "tournament_test_1";
const currentUserId = "user_current";

describe("getAdditionalBetEvents", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns null when tournament not found", async () => {
        prisma.tournament.findUnique.mockResolvedValue(null);

        const result = await getAdditionalBetEvents(
            tournamentId,
            currentUserId,
        );

        expect(result).toBeNull();
    });

    it("returns events with current user bet and empty otherUsersBets before deadline", async () => {
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({ id: tournamentId }),
        );
        prisma.additionalBetEvent.findMany.mockResolvedValue([
            {
                ...makeAdditionalBetEvent({
                    id: "abe_1",
                    tournamentId,
                    deadline: new Date("2026-06-20T12:00:00.000Z"),
                }),
                bets: [
                    {
                        ...makeAdditionalBet({
                            eventId: "abe_1",
                            userId: currentUserId,
                            answer: "Poland",
                        }),
                        user: makeUser({
                            id: currentUserId,
                            name: "Current User",
                        }),
                    },
                    {
                        ...makeAdditionalBet({
                            id: "ab_2",
                            eventId: "abe_1",
                            userId: "user_other",
                            answer: "Germany",
                        }),
                        user: makeUser({
                            id: "user_other",
                            name: "Other User",
                        }),
                    },
                ],
            },
        ] as never);

        const result = await getAdditionalBetEvents(
            tournamentId,
            currentUserId,
        );

        expect(result).toEqual([
            {
                id: "abe_1",
                tournamentId,
                name: "Who will win?",
                deadline: new Date("2026-06-20T12:00:00.000Z"),
                points: 5,
                answer: null,
                createdAt: expect.any(Date),
                currentUserBet: "Poland",
                otherUsersBets: [],
            },
        ]);
    });

    it("exposes otherUsersBets after deadline", async () => {
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({ id: tournamentId }),
        );
        prisma.additionalBetEvent.findMany.mockResolvedValue([
            {
                ...makeAdditionalBetEvent({
                    id: "abe_1",
                    tournamentId,
                    deadline: new Date("2026-06-10T12:00:00.000Z"),
                }),
                bets: [
                    {
                        ...makeAdditionalBet({
                            eventId: "abe_1",
                            userId: currentUserId,
                            answer: "Poland",
                        }),
                        user: makeUser({
                            id: currentUserId,
                            name: "Current User",
                        }),
                    },
                    {
                        ...makeAdditionalBet({
                            id: "ab_2",
                            eventId: "abe_1",
                            userId: "user_other",
                            answer: "Germany",
                        }),
                        user: makeUser({
                            id: "user_other",
                            name: "Other User",
                        }),
                    },
                ],
            },
        ] as never);

        const result = await getAdditionalBetEvents(
            tournamentId,
            currentUserId,
        );

        expect(result?.[0].otherUsersBets).toEqual([
            {
                userId: "user_other",
                name: "Other User",
                answer: "Germany",
            },
        ]);
    });
});
