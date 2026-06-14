import { describe, expect, it } from "vitest";

import { getCacheTag } from "@/lib/cache-tags";

describe("getCacheTag", () => {
    it("builds a single-param tag as id:value", () => {
        expect(
            getCacheTag("leaderboard", { tournamentId: "tournament_1" }),
        ).toBe("leaderboard:tournament_1");
    });

    it("creates the same tag for the same params", () => {
        const a = getCacheTag("tournaments-for-group", {
            // @ts-expect-error - just for testing
            other: "2",
            groupId: "1",
        });
        const b = getCacheTag("tournaments-for-group", {
            groupId: "1",
            // @ts-expect-error - just for testing
            other: "2",
        });
        expect(a).toBe(b);
    });
});
