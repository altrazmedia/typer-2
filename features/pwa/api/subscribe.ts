import "server-only";

import { NextResponse } from "next/server";

import { requireSessionAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

import { parsePushSubscribeBody } from "@/features/pwa/schema";

export async function subscribePush(request: Request) {
    const authResult = await requireSessionAuth();
    if (!authResult.ok) {
        return authResult.response;
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowe dane wejściowe." },
            { status: 400 },
        );
    }

    const parsed = parsePushSubscribeBody(body);
    if (!parsed) {
        return NextResponse.json(
            { error: "Nieprawidłowe dane wejściowe." },
            { status: 400 },
        );
    }

    const userId = authResult.session.user.id;

    await prisma.pushSubscription.upsert({
        where: { endpoint: parsed.endpoint },
        create: {
            userId,
            endpoint: parsed.endpoint,
            p256dh: parsed.keys.p256dh,
            auth: parsed.keys.auth,
        },
        update: {
            userId,
            p256dh: parsed.keys.p256dh,
            auth: parsed.keys.auth,
        },
    });

    return NextResponse.json({ ok: true });
}

export async function unsubscribePush(request: Request) {
    const authResult = await requireSessionAuth();
    if (!authResult.ok) {
        return authResult.response;
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowe dane wejściowe." },
            { status: 400 },
        );
    }

    const parsed = parsePushSubscribeBody(body);
    if (!parsed) {
        return NextResponse.json(
            { error: "Nieprawidłowe dane wejściowe." },
            { status: 400 },
        );
    }

    const userId = authResult.session.user.id;

    await prisma.pushSubscription.deleteMany({
        where: {
            endpoint: parsed.endpoint,
            userId,
        },
    });

    return NextResponse.json({ ok: true });
}
