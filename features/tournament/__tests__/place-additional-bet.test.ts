import { revalidateTag } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { placeAdditionalBetAction } from "@/features/tournament/actions/place-additional-bet";
import { getCacheTag } from "@/lib/cache-tags";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeAdditionalBetEvent, makeGroupMember } from "@/test/factories";
import { prisma } from "@/test/prisma";

const eventId = "abe_test_1";
const tournamentId = "tournament_test_1";

function mockOpenEvent(deadline: Date): void {
    prisma.additionalBetEvent.findUnique.mockResolvedValue({
        ...makeAdditionalBetEvent({ id: eventId, deadline }),
        tournament: {
            id: tournamentId,
            groupId: "group_test_1",
        },
    } as never);
}

describe("placeAdditionalBetAction", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns error when unauthenticated", async () => {
        mockUnauthed();

        const result = await placeAdditionalBetAction({
            eventId,
            answer: "Poland",
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Wymagane uwierzytelnienie.",
        });
    });

    it("returns error when event is not found", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.additionalBetEvent.findUnique.mockResolvedValue(null);

        const result = await placeAdditionalBetAction({
            eventId: "missing",
            answer: "Poland",
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Wydarzenie nie zostało znalezione.",
        });
    });

    it("returns error when user is not a group member", async () => {
        mockAuthedUser({ id: "u1" });
        mockOpenEvent(new Date("2026-06-20T12:00:00.000Z"));
        prisma.groupMember.findFirst.mockResolvedValue(null);

        const result = await placeAdditionalBetAction({
            eventId,
            answer: "Poland",
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Brak dostępu do tej grupy.",
        });
    });

    it("returns error when deadline has passed", async () => {
        mockAuthedUser({ id: "u1" });
        mockOpenEvent(new Date("2026-06-10T12:00:00.000Z"));
        prisma.groupMember.findFirst.mockResolvedValue(makeGroupMember());

        const result = await placeAdditionalBetAction({
            eventId,
            answer: "Poland",
        });

        expect(result).toEqual({
            isSuccess: false,
            errorMessage: "Termin składania zakładów na to wydarzenie minął.",
        });
    });

    it("upserts bet before deadline and revalidates user cache tag", async () => {
        mockAuthedUser({ id: "u1" });
        mockOpenEvent(new Date("2026-06-20T12:00:00.000Z"));
        prisma.groupMember.findFirst.mockResolvedValue(
            makeGroupMember({ userId: "u1" }),
        );
        prisma.additionalBet.upsert.mockResolvedValue({} as never);

        const result = await placeAdditionalBetAction({
            eventId,
            answer: "  Poland  ",
        });

        expect(result).toEqual({ isSuccess: true });
        expect(prisma.additionalBet.upsert).toHaveBeenCalledWith({
            where: {
                eventId_userId: {
                    eventId,
                    userId: "u1",
                },
            },
            create: {
                eventId,
                userId: "u1",
                answer: "Poland",
            },
            update: {
                answer: "Poland",
            },
        });
        expect(revalidateTag).toHaveBeenCalledWith(
            getCacheTag("additional-bet-events-user", {
                tournamentId,
                userId: "u1",
            }),
            "max",
        );
    });
});
