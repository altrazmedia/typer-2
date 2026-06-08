import { describe, expect, it } from "vitest";

import { parsePushSubscribeBody } from "@/features/pwa/schema";

describe("parsePushSubscribeBody", () => {
    it("returns null for invalid payloads", () => {
        expect(parsePushSubscribeBody(null)).toBeNull();
        expect(parsePushSubscribeBody({})).toBeNull();
        expect(parsePushSubscribeBody({ endpoint: "https://x" })).toBeNull();
        expect(
            parsePushSubscribeBody({
                endpoint: "https://x",
                keys: { p256dh: "a" },
            }),
        ).toBeNull();
    });

    it("parses a valid subscription body", () => {
        expect(
            parsePushSubscribeBody({
                endpoint: " https://push.example/sub ",
                keys: {
                    p256dh: " p256dh ",
                    auth: " auth ",
                },
            }),
        ).toEqual({
            endpoint: "https://push.example/sub",
            keys: {
                p256dh: "p256dh",
                auth: "auth",
            },
        });
    });
});
