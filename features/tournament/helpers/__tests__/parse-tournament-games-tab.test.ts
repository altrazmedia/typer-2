import { describe, expect, it } from "vitest";

import { parseTournamentGamesTab } from "@/features/tournament/helpers/parse-tournament-games-tab";

describe("parseTournamentGamesTab", () => {
    it("defaults to upcoming", () => {
        expect(parseTournamentGamesTab(undefined)).toBe("upcoming");
    });

    it("returns finished only for tab=finished", () => {
        expect(parseTournamentGamesTab("finished")).toBe("finished");
    });

    it("treats unknown values as upcoming", () => {
        expect(parseTournamentGamesTab("other")).toBe("upcoming");
    });

    it("uses the first value when tab is an array", () => {
        expect(parseTournamentGamesTab(["finished", "upcoming"])).toBe(
            "finished",
        );
    });
});
