import { describe, expect, it } from "vitest";

import { parseKickoffAtUtc } from "@/features/game/helpers/parse-kickoff-at-utc";

describe("parseKickoffAtUtc", () => {
    it("parses an ISO string with Z suffix to UTC Date", () => {
        const result = parseKickoffAtUtc("2026-07-01T20:00:00.000Z");

        expect(result.toISOString()).toBe("2026-07-01T20:00:00.000Z");
    });

    it("parses an ISO string with numeric offset to UTC Date", () => {
        const result = parseKickoffAtUtc("2026-07-01T22:00:00+02:00");

        expect(result.toISOString()).toBe("2026-07-01T20:00:00.000Z");
    });

    it("assumes UTC when string has no timezone info", () => {
        const result = parseKickoffAtUtc("2026-07-01T20:00:00");

        expect(result.toISOString()).toBe("2026-07-01T20:00:00.000Z");
    });

    it("throws when string is invalid", () => {
        expect(() => parseKickoffAtUtc("2026-99-99T00:00:00Z")).toThrow(
            "Podaj prawidłową datę rozpoczęcia meczu.",
        );
    });
});
