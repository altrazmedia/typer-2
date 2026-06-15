import "server-only";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
    isStalePushSubscriptionError,
    sendPushNotification,
} from "@/lib/webpush";

const NOTIFICATION_TITLE = "Czas na typowanie!";
const NOTIFICATION_BODY = "Brakuje Twoich typów na dzisiejsze gierki";
const NOTIFICATION_URL = "/tournaments";

function verifyCronSecret(request: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return false;
    }

    const authHeader = request.headers.get("Authorization");
    return authHeader === `Bearer ${secret}`;
}

function logMessage(message: string) {
    console.log(`[notify-missing-bets] ${message}`);
}

export async function notifyMissingBets(request: Request) {
    try {
        if (!verifyCronSecret(request)) {
            logMessage("invalid cron secret");
            return NextResponse.json(
                { error: "Brak autoryzacji." },
                { status: 401 },
            );
        }

        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const games = await prisma.game.findMany({
            where: {
                kickoffAt: {
                    gte: now,
                    lte: in24Hours,
                },
            },
            select: {
                bets: {
                    select: {
                        userId: true,
                    },
                },
                tournament: {
                    select: {
                        group: {
                            select: {
                                members: {
                                    select: {
                                        userId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const userIdsWithMissingBets = new Set<string>();

        for (const game of games) {
            const betUserIds = new Set(game.bets.map((bet) => bet.userId));

            for (const member of game.tournament.group.members) {
                if (!betUserIds.has(member.userId)) {
                    userIdsWithMissingBets.add(member.userId);
                }
            }
        }

        logMessage(
            `games in 24h: ${games.length}, users with missing bets: ${userIdsWithMissingBets.size}`,
        );

        if (userIdsWithMissingBets.size === 0) {
            logMessage("no users with missing bets, skipping");
            return NextResponse.json({ sent: 0, removed: 0 });
        }

        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                userId: {
                    in: [...userIdsWithMissingBets],
                },
            },
        });

        logMessage(`push subscriptions found: ${subscriptions.length}`);

        let sent = 0;
        let removed = 0;

        for (const subscription of subscriptions) {
            try {
                await sendPushNotification(
                    {
                        endpoint: subscription.endpoint,
                        p256dh: subscription.p256dh,
                        auth: subscription.auth,
                    },
                    {
                        title: NOTIFICATION_TITLE,
                        body: NOTIFICATION_BODY,
                        url: NOTIFICATION_URL,
                    },
                );
                sent += 1;
            } catch (error) {
                logMessage(
                    `error sending push notification: ${error}; ${JSON.stringify(error)}`,
                );
                if (isStalePushSubscriptionError(error)) {
                    logMessage(
                        `removing stale subscription: ${subscription.id}`,
                    );
                    await prisma.pushSubscription.delete({
                        where: { id: subscription.id },
                    });
                    removed += 1;
                }
            }
        }

        logMessage(`done — sent: ${sent}, removed: ${removed}`);

        return NextResponse.json({ sent, removed });
    } catch (error) {
        logMessage(`error: ${error}`);
        return NextResponse.json(
            { error: "Wystąpił błąd podczas wysyłania powiadomień." },
            { status: 500 },
        );
    }
}
