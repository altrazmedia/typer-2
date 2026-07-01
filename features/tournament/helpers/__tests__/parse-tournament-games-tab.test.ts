import { describe, expect, it } from "vitest";

import { parseTournamentGamesTab } from "@/features/tournament/helpers/parse-tournament-games-tab";

describe("parseTournamentGamesTab", () => {
    it("defaults to upcoming", () => {
        expect(parseTournamentGamesTab(undefined)).toBe("upcoming");
    });

    it("returns finished only for tab=finished", () => {
        expect(parseTournamentGamesTab("finished")).toBe("finished");
    });

    it("returns leaderboard for tab=leaderboard", () => {
        expect(parseTournamentGamesTab("leaderboard")).toBe("leaderboard");
    });

    it("returns additional-bets for tab=additional-bets", () => {
        expect(parseTournamentGamesTab("additional-bets")).toBe(
            "additional-bets",
        );
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
