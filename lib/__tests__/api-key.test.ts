import { describe, expect, it } from "vitest";

import { generateApiKey, hashApiKey } from "@/lib/api-key";

describe("api-key", () => {
    it("hashes keys deterministically", () => {
        const rawKey = "typ_example_key";
        expect(hashApiKey(rawKey)).toBe(hashApiKey(rawKey));
        expect(hashApiKey(rawKey)).not.toBe(rawKey);
    });

    it("generates keys with typ_ prefix and matching hash", () => {
        const { rawKey, keyHash } = generateApiKey();
        expect(rawKey.startsWith("typ_")).toBe(true);
        expect(keyHash).toBe(hashApiKey(rawKey));
    });

    it("generates unique keys", () => {
        const first = generateApiKey();
        const second = generateApiKey();
        expect(first.rawKey).not.toBe(second.rawKey);
        expect(first.keyHash).not.toBe(second.keyHash);
    });
});
