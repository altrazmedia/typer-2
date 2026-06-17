"use server";

import "server-only";

import { revalidateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";
import type { ServerActionResponse } from "@/lib/types";
import {
    getSuccessActionResponse,
    getErrorActionResponse,
} from "@/lib/server-action-response";

interface PlaceAdditionalBetActionArgs {
    eventId: string;
    answer: string;
}

export async function placeAdditionalBetAction(
    args: PlaceAdditionalBetActionArgs,
): Promise<ServerActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return getErrorActionResponse("Wymagane uwierzytelnienie.");
    }

    const trimmedAnswer = args.answer.trim();
    if (!trimmedAnswer) {
        return getErrorActionResponse("Podaj odpowiedź.");
    }

    const event = await prisma.additionalBetEvent.findUnique({
        where: { id: args.eventId },
        select: {
            id: true,
            deadline: true,
            tournament: {
                select: {
                    id: true,
                    groupId: true,
                },
            },
        },
    });

    if (!event) {
        return getErrorActionResponse("Wydarzenie nie zostało znalezione.");
    }

    const membership = await prisma.groupMember.findFirst({
        where: {
            groupId: event.tournament.groupId,
            userId: session.user.id,
        },
    });

    if (!membership) {
        return getErrorActionResponse("Brak dostępu do tej grupy.");
    }

    if (event.deadline <= new Date()) {
        return getErrorActionResponse(
            "Termin składania zakładów na to wydarzenie minął.",
        );
    }

    try {
        await prisma.additionalBet.upsert({
            where: {
                eventId_userId: {
                    eventId: args.eventId,
                    userId: session.user.id,
                },
            },
            create: {
                eventId: args.eventId,
                userId: session.user.id,
                answer: trimmedAnswer,
            },
            update: {
                answer: trimmedAnswer,
            },
        });

        revalidateTag(
            getCacheTag("additional-bet-events-user", {
                tournamentId: event.tournament.id,
                userId: session.user.id,
            }),
            "max",
        );

        return getSuccessActionResponse();
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Nie udało się zapisać zakładu.";
        return getErrorActionResponse(errorMessage);
    }
}
