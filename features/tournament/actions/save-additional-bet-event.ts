"use server";

import "server-only";

import { revalidateTag } from "next/cache";
import dayjs from "dayjs";

import { auth } from "@/lib/auth";
import { requireTournamentAdmin } from "@/lib/api-utils";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";
import type { ServerActionResponse } from "@/lib/types";
import {
    getSuccessActionResponse,
    getErrorActionResponse,
} from "@/lib/server-action-response";

interface SaveAdditionalBetEventActionArgs {
    tournamentId: string;
    id?: string;
    name: string;
    deadline: string;
    points: number;
    answer?: string | null;
}

export async function saveAdditionalBetEventAction(
    args: SaveAdditionalBetEventActionArgs,
): Promise<ServerActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return getErrorActionResponse("Wymagane uwierzytelnienie.");
    }

    const adminResult = await requireTournamentAdmin(
        args.tournamentId,
        session.user.id,
    );
    if (!adminResult.ok) {
        if (adminResult.reason === "not_found") {
            return getErrorActionResponse("Turniej nie został znaleziony.");
        }
        return getErrorActionResponse(
            "Brak uprawnień administratora tej grupy.",
        );
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
        return getErrorActionResponse("Podaj nazwę wydarzenia.");
    }

    if (!Number.isInteger(args.points) || args.points < 0) {
        return getErrorActionResponse("Podaj prawidłową liczbę punktów.");
    }

    const deadlineStr = args.deadline.trim();
    const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(deadlineStr);
    const parsed = dayjs(hasTimezone ? deadlineStr : deadlineStr + "Z");

    if (!parsed.isValid()) {
        return getErrorActionResponse("Podaj prawidłowy termin.");
    }

    const deadline = parsed.toDate();

    const normalizedAnswer =
        args.answer === undefined
            ? undefined
            : args.answer === null
              ? null
              : args.answer.trim() || null;

    try {
        if (args.id) {
            const existingEvent = await prisma.additionalBetEvent.findFirst({
                where: {
                    id: args.id,
                    tournamentId: args.tournamentId,
                },
            });

            if (!existingEvent) {
                return getErrorActionResponse(
                    "Wydarzenie nie zostało znalezione.",
                );
            }

            const answerChanged =
                normalizedAnswer !== undefined &&
                normalizedAnswer !== existingEvent.answer;
            const pointsChanged = args.points !== existingEvent.points;

            const event = await prisma.additionalBetEvent.update({
                where: { id: args.id },
                data: {
                    name: trimmedName,
                    deadline: deadline,
                    points: args.points,
                    ...(normalizedAnswer !== undefined
                        ? { answer: normalizedAnswer }
                        : {}),
                },
            });

            revalidateTag(
                getCacheTag("additional-bet-events", {
                    tournamentId: args.tournamentId,
                }),
                "max",
            );

            if (answerChanged || pointsChanged) {
                revalidateTag(
                    getCacheTag("leaderboard", {
                        tournamentId: args.tournamentId,
                    }),
                    "max",
                );
            }

            return getSuccessActionResponse({ id: event.id });
        }

        const event = await prisma.additionalBetEvent.create({
            data: {
                tournamentId: args.tournamentId,
                name: trimmedName,
                deadline: deadline,
                points: args.points,
                ...(normalizedAnswer !== undefined
                    ? { answer: normalizedAnswer }
                    : {}),
            },
        });

        revalidateTag(
            getCacheTag("additional-bet-events", {
                tournamentId: args.tournamentId,
            }),
            "max",
        );

        if (normalizedAnswer !== undefined && normalizedAnswer !== null) {
            revalidateTag(
                getCacheTag("leaderboard", { tournamentId: args.tournamentId }),
                "max",
            );
        }

        return getSuccessActionResponse({ id: event.id });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Nie udało się zapisać wydarzenia.";
        return getErrorActionResponse(errorMessage);
    }
}
