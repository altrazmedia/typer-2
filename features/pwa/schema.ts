export type PushSubscribeBody = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

export function parsePushSubscribeBody(
    body: unknown,
): PushSubscribeBody | null {
    if (typeof body !== "object" || body === null) {
        return null;
    }

    const record = body as Record<string, unknown>;
    const endpoint = record.endpoint;
    const keys = record.keys;

    if (typeof endpoint !== "string" || endpoint.trim().length === 0) {
        return null;
    }

    if (typeof keys !== "object" || keys === null) {
        return null;
    }

    const keysRecord = keys as Record<string, unknown>;
    const p256dh = keysRecord.p256dh;
    const auth = keysRecord.auth;

    if (typeof p256dh !== "string" || p256dh.trim().length === 0) {
        return null;
    }

    if (typeof auth !== "string" || auth.trim().length === 0) {
        return null;
    }

    return {
        endpoint: endpoint.trim(),
        keys: {
            p256dh: p256dh.trim(),
            auth: auth.trim(),
        },
    };
}
