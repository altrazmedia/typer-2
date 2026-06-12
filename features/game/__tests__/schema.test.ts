import { describe, expect, it } from "vitest";

import {
    parseCreateGameBody,
    parseSubmitResultBody,
    parseUpdateGameBody,
} from "@/features/game/schema";

describe("parseCreateGameBody", () => {
    it("parses valid body", () => {
        const kickoffAt = "2026-06-01T18:00:00.000Z";
        const out = parseCreateGameBody({
            tournamentId: "t1",
            homeTeam: "  Home  ",
            awayTeam: "Away",
            kickoffAt,
        });
        expect(out).toEqual({
            tournamentId: "t1",
            homeTeam: "Home",
            awayTeam: "Away",
            kickoffAt,
        });
    });

    it("returns null when tournamentId missing", () => {
        expect(
            parseCreateGameBody({
                homeTeam: "A",
                awayTeam: "B",
                kickoffAt: new Date().toISOString(),
            }),
        ).toBeNull();
    });

    it("returns null when kickoffAt is empty", () => {
        expect(
            parseCreateGameBody({
                tournamentId: "t1",
                homeTeam: "A",
                awayTeam: "B",
                kickoffAt: "  ",
            }),
        ).toBeNull();
    });
});

describe("parseUpdateGameBody", () => {
    it("parses partial update", () => {
        const out = parseUpdateGameBody({ homeTeam: "  X  " });
        expect(out).toEqual({ homeTeam: "X" });
    });

    it("returns null when no fields provided", () => {
        expect(parseUpdateGameBody({})).toBeNull();
    });

    it("parses kickoffAt as trimmed string", () => {
        expect(
            parseUpdateGameBody({ kickoffAt: " 2026-06-01T18:00:00.000Z " }),
        ).toEqual({ kickoffAt: "2026-06-01T18:00:00.000Z" });
    });
});

describe("parseSubmitResultBody", () => {
    it("parses valid scores", () => {
        expect(parseSubmitResultBody({ homeScore: 2, awayScore: 1 })).toEqual({
            homeScore: 2,
            awayScore: 1,
        });
    });

    it("returns null for negative scores", () => {
        expect(
            parseSubmitResultBody({ homeScore: -1, awayScore: 0 }),
        ).toBeNull();
    });

    it("returns null for non-integers", () => {
        expect(
            parseSubmitResultBody({ homeScore: 1.5, awayScore: 0 }),
        ).toBeNull();
    });
});
