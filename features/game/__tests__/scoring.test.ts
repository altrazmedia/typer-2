import { BetResult } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { classifyBet } from "@/features/game/scoring";

describe("classifyBet", () => {
    it("returns EXACT_SCORE on exact score match", () => {
        expect(
            classifyBet(
                { homeScore: 2, awayScore: 1 },
                { homeScore: 2, awayScore: 1 },
            ),
        ).toBe(BetResult.EXACT_SCORE);
    });

    it("returns CORRECT_OUTCOME on home win with wrong score", () => {
        expect(
            classifyBet(
                { homeScore: 3, awayScore: 0 },
                { homeScore: 1, awayScore: 0 },
            ),
        ).toBe(BetResult.CORRECT_OUTCOME);
    });

    it("returns CORRECT_OUTCOME on draw with wrong score", () => {
        expect(
            classifyBet(
                { homeScore: 1, awayScore: 1 },
                { homeScore: 0, awayScore: 0 },
            ),
        ).toBe(BetResult.CORRECT_OUTCOME);
    });

    it("returns CORRECT_OUTCOME on away win with wrong score", () => {
        expect(
            classifyBet(
                { homeScore: 0, awayScore: 2 },
                { homeScore: 1, awayScore: 3 },
            ),
        ).toBe(BetResult.CORRECT_OUTCOME);
    });

    it("returns INCORRECT on wrong outcome", () => {
        expect(
            classifyBet(
                { homeScore: 2, awayScore: 0 },
                { homeScore: 0, awayScore: 1 },
            ),
        ).toBe(BetResult.INCORRECT);
    });

    it("returns EXACT_SCORE on 0-0 exact match", () => {
        expect(
            classifyBet(
                { homeScore: 0, awayScore: 0 },
                { homeScore: 0, awayScore: 0 },
            ),
        ).toBe(BetResult.EXACT_SCORE);
    });
});
