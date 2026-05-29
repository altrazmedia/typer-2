import { describe, expect, it } from "vitest";

import { parsePlaceBetBody } from "@/features/bet/schema";

describe("parsePlaceBetBody", () => {
    it("parses valid body", () => {
        const out = parsePlaceBetBody({
            gameId: "game_1",
            homeScore: 2,
            awayScore: 3,
        });
        expect(out).toEqual({
            gameId: "game_1",
            homeScore: 2,
            awayScore: 3,
        });
    });

    it("returns null when gameId missing", () => {
        expect(
            parsePlaceBetBody({
                homeScore: 0,
                awayScore: 0,
            }),
        ).toBeNull();
    });

    it("returns null when homeScore is -1", () => {
        expect(
            parsePlaceBetBody({
                gameId: "g1",
                homeScore: -1,
                awayScore: 0,
            }),
        ).toBeNull();
    });

    it("returns null when awayScore is 11", () => {
        expect(
            parsePlaceBetBody({
                gameId: "g1",
                homeScore: 0,
                awayScore: 11,
            }),
        ).toBeNull();
    });

    it("returns null for non-integer scores", () => {
        expect(
            parsePlaceBetBody({
                gameId: "g1",
                homeScore: 1.5,
                awayScore: 0,
            }),
        ).toBeNull();
    });

    it("strips extra fields from output", () => {
        const out = parsePlaceBetBody({
            gameId: "  g99  ",
            homeScore: 1,
            awayScore: 0,
            extra: "ignored",
            foo: 123,
        });
        expect(out).not.toBeNull();
        expect(Object.keys(out!).sort()).toEqual([
            "awayScore",
            "gameId",
            "homeScore",
        ]);
        expect(out).toEqual({
            gameId: "g99",
            homeScore: 1,
            awayScore: 0,
        });
    });
});
