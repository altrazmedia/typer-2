import { describe, expect, it } from "vitest";

import { calculatePoints } from "@/features/game/scoring";

const defaultRule = { exactScorePoints: 3, correctOutcomePoints: 1 };

describe("calculatePoints", () => {
    it("returns exactScorePoints on exact score match", () => {
        expect(
            calculatePoints(
                { homeScore: 2, awayScore: 1 },
                { homeScore: 2, awayScore: 1 },
                defaultRule,
            ),
        ).toBe(3);
    });

    it("returns correctOutcomePoints on home win with wrong score", () => {
        expect(
            calculatePoints(
                { homeScore: 3, awayScore: 0 },
                { homeScore: 1, awayScore: 0 },
                defaultRule,
            ),
        ).toBe(1);
    });

    it("returns correctOutcomePoints on draw with wrong score", () => {
        expect(
            calculatePoints(
                { homeScore: 1, awayScore: 1 },
                { homeScore: 0, awayScore: 0 },
                defaultRule,
            ),
        ).toBe(1);
    });

    it("returns correctOutcomePoints on away win with wrong score", () => {
        expect(
            calculatePoints(
                { homeScore: 0, awayScore: 2 },
                { homeScore: 1, awayScore: 3 },
                defaultRule,
            ),
        ).toBe(1);
    });

    it("returns 0 on wrong outcome", () => {
        expect(
            calculatePoints(
                { homeScore: 2, awayScore: 0 },
                { homeScore: 0, awayScore: 1 },
                defaultRule,
            ),
        ).toBe(0);
    });

    it("returns exactScorePoints on 0-0 exact match", () => {
        expect(
            calculatePoints(
                { homeScore: 0, awayScore: 0 },
                { homeScore: 0, awayScore: 0 },
                defaultRule,
            ),
        ).toBe(3);
    });
});
