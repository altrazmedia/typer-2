import { describe, expect, it } from "vitest";

import { computeAdditionalBetPoints } from "@/features/tournament/helpers/compute-additional-bet-points";

describe("computeAdditionalBetPoints", () => {
    it("returns 0 when there are no events", () => {
        const result = computeAdditionalBetPoints([], new Map());

        expect(result).toBe(0);
    });

    it("returns 0 when event answer is not set", () => {
        const result = computeAdditionalBetPoints(
            [{ id: "e1", points: 5, answer: null }],
            new Map([["e1", "Poland"]]),
        );

        expect(result).toBe(0);
    });

    it("returns 0 when user has no bet for an event", () => {
        const result = computeAdditionalBetPoints(
            [{ id: "e1", points: 5, answer: "Poland" }],
            new Map(),
        );

        expect(result).toBe(0);
    });

    it("awards points on case-insensitive match", () => {
        const result = computeAdditionalBetPoints(
            [{ id: "e1", points: 5, answer: "Poland" }],
            new Map([["e1", "poland"]]),
        );

        expect(result).toBe(5);
    });

    it("returns 0 when answer does not match", () => {
        const result = computeAdditionalBetPoints(
            [{ id: "e1", points: 5, answer: "Poland" }],
            new Map([["e1", "Germany"]]),
        );

        expect(result).toBe(0);
    });

    it("sums points across multiple matching events", () => {
        const result = computeAdditionalBetPoints(
            [
                { id: "e1", points: 5, answer: "Poland" },
                { id: "e2", points: 3, answer: "Messi" },
                { id: "e3", points: 10, answer: null },
            ],
            new Map([
                ["e1", "POLAND"],
                ["e2", "messi"],
                ["e3", "Ronaldo"],
            ]),
        );

        expect(result).toBe(8);
    });
});
