import { describe, expect, it } from "vitest";

import { classifyGames } from "@/features/tournament/helpers/classify-games";

describe("classifyGames", () => {
    it("returns empty split for empty input", () => {
        const now = new Date("2026-04-27T12:00:00.000Z");
        expect(classifyGames([], now)).toEqual({ finished: [], upcoming: [] });
    });

    it("treats kickoff strictly after now as upcoming", () => {
        const now = new Date("2026-04-27T12:00:00.000Z");
        const a = { id: "1", kickoffAt: new Date("2026-04-27T12:00:00.001Z") };
        const { upcoming, finished } = classifyGames([a], now);
        expect(upcoming).toEqual([a]);
        expect(finished).toEqual([]);
    });

    it("treats kickoff at exactly the same millisecond as now as finished", () => {
        const now = new Date("2026-04-27T12:00:00.000Z");
        const a = { id: "1", kickoffAt: new Date("2026-04-27T12:00:00.000Z") };
        const { upcoming, finished } = classifyGames([a], now);
        expect(upcoming).toEqual([]);
        expect(finished).toEqual([a]);
    });

    it("treats kickoff before now as finished", () => {
        const now = new Date("2026-04-27T12:00:00.000Z");
        const a = { id: "1", kickoffAt: new Date("2026-04-26T12:00:00.000Z") };
        const { upcoming, finished } = classifyGames([a], now);
        expect(upcoming).toEqual([]);
        expect(finished).toEqual([a]);
    });

    it("sorts upcoming ascending by kickoff (closest first)", () => {
        const now = new Date("2026-04-27T12:00:00.000Z");
        const later = {
            id: "2",
            kickoffAt: new Date("2026-04-30T12:00:00.000Z"),
        };
        const sooner = {
            id: "1",
            kickoffAt: new Date("2026-04-28T12:00:00.000Z"),
        };
        const { upcoming } = classifyGames([later, sooner], now);
        expect(upcoming.map((g) => g.id)).toEqual(["1", "2"]);
    });

    it("sorts finished descending by kickoff (newest first)", () => {
        const now = new Date("2026-04-27T12:00:00.000Z");
        const older = {
            id: "1",
            kickoffAt: new Date("2026-04-20T12:00:00.000Z"),
        };
        const newer = {
            id: "2",
            kickoffAt: new Date("2026-04-25T12:00:00.000Z"),
        };
        const { finished } = classifyGames([older, newer], now);
        expect(finished.map((g) => g.id)).toEqual(["2", "1"]);
    });
});
