import type { GroupMember, User } from "@prisma/client";
import { BetResult } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
    aggregateLeaderboardEntries,
    assignStandardRanks,
    getTournamentLeaderboard,
} from "@/features/tournament/server/get-tournament-leaderboard";
import {
    makeBet,
    makeGroupMember,
    makeTournament,
    makeUser,
} from "@/test/factories";
import { prisma } from "@/test/prisma";

const scoring = { exactScorePoints: 3, correctOutcomePoints: 1 };

describe("aggregateLeaderboardEntries", () => {
    it("includes all members with zero counts when there are no scored bets", () => {
        const members = [
            { userId: "u1", name: "Alice" },
            { userId: "u2", name: "Bob" },
        ];

        const rows = aggregateLeaderboardEntries(members, [], scoring);

        expect(rows).toEqual([
            {
                userId: "u1",
                name: "Alice",
                exactScoreBets: 0,
                correctOutcomeBets: 0,
                additionalBetPoints: 0,
                totalPoints: 0,
            },
            {
                userId: "u2",
                name: "Bob",
                exactScoreBets: 0,
                correctOutcomeBets: 0,
                additionalBetPoints: 0,
                totalPoints: 0,
            },
        ]);
    });

    it("counts exact score and correct outcome bets per user", () => {
        const members = [
            { userId: "u1", name: "Alice" },
            { userId: "u2", name: "Bob" },
        ];
        const bets = [
            { userId: "u1", betResult: BetResult.EXACT_SCORE },
            { userId: "u1", betResult: BetResult.EXACT_SCORE },
            { userId: "u1", betResult: BetResult.CORRECT_OUTCOME },
            { userId: "u2", betResult: BetResult.CORRECT_OUTCOME },
            { userId: "u2", betResult: BetResult.INCORRECT },
        ];

        const rows = aggregateLeaderboardEntries(members, bets, scoring);

        expect(rows).toEqual([
            {
                userId: "u1",
                name: "Alice",
                exactScoreBets: 2,
                correctOutcomeBets: 1,
                additionalBetPoints: 0,
                totalPoints: 7,
            },
            {
                userId: "u2",
                name: "Bob",
                exactScoreBets: 0,
                correctOutcomeBets: 1,
                additionalBetPoints: 0,
                totalPoints: 1,
            },
        ]);
    });

    it("computes totalPoints from tournament scoring config", () => {
        const members = [{ userId: "u1", name: "Alice" }];
        const bets = [
            { userId: "u1", betResult: BetResult.EXACT_SCORE },
            { userId: "u1", betResult: BetResult.CORRECT_OUTCOME },
        ];

        const rows = aggregateLeaderboardEntries(members, bets, {
            exactScorePoints: 5,
            correctOutcomePoints: 2,
        });

        expect(rows[0].totalPoints).toBe(7);
    });

    it("includes additional bet points in totalPoints", () => {
        const members = [
            { userId: "u1", name: "Alice" },
            { userId: "u2", name: "Bob" },
        ];
        const additionalBetPointsByUser = new Map([
            ["u1", 5],
            ["u2", 0],
        ]);

        const rows = aggregateLeaderboardEntries(
            members,
            [],
            scoring,
            additionalBetPointsByUser,
        );

        expect(rows).toEqual([
            {
                userId: "u1",
                name: "Alice",
                exactScoreBets: 0,
                correctOutcomeBets: 0,
                additionalBetPoints: 5,
                totalPoints: 5,
            },
            {
                userId: "u2",
                name: "Bob",
                exactScoreBets: 0,
                correctOutcomeBets: 0,
                additionalBetPoints: 0,
                totalPoints: 0,
            },
        ]);
    });

    it("sorts by totalPoints DESC then exactScoreBets DESC", () => {
        const members = [
            { userId: "u1", name: "Alice" },
            { userId: "u2", name: "Bob" },
            { userId: "u3", name: "Carol" },
        ];
        const bets = [
            { userId: "u1", betResult: BetResult.CORRECT_OUTCOME },
            { userId: "u2", betResult: BetResult.EXACT_SCORE },
            { userId: "u3", betResult: BetResult.EXACT_SCORE },
            { userId: "u3", betResult: BetResult.EXACT_SCORE },
        ];

        const rows = aggregateLeaderboardEntries(members, bets, scoring);

        expect(rows.map((row) => row.userId)).toEqual(["u3", "u2", "u1"]);
    });

    it("ignores bets with null betResult", () => {
        const members = [{ userId: "u1", name: "Alice" }];
        const bets = [
            { userId: "u1", betResult: null },
            { userId: "u1", betResult: BetResult.EXACT_SCORE },
        ];

        const rows = aggregateLeaderboardEntries(members, bets, scoring);

        expect(rows[0].exactScoreBets).toBe(1);
        expect(rows[0].totalPoints).toBe(3);
    });
});

describe("assignStandardRanks", () => {
    it("assigns standard ranking with tied players sharing rank", () => {
        const rows = [
            {
                userId: "u1",
                name: "Alice",
                exactScoreBets: 2,
                correctOutcomeBets: 0,
                additionalBetPoints: 0,
                totalPoints: 6,
            },
            {
                userId: "u2",
                name: "Bob",
                exactScoreBets: 1,
                correctOutcomeBets: 1,
                additionalBetPoints: 0,
                totalPoints: 4,
            },
            {
                userId: "u3",
                name: "Carol",
                exactScoreBets: 1,
                correctOutcomeBets: 1,
                additionalBetPoints: 0,
                totalPoints: 4,
            },
            {
                userId: "u4",
                name: "Dave",
                exactScoreBets: 0,
                correctOutcomeBets: 1,
                additionalBetPoints: 0,
                totalPoints: 1,
            },
        ];

        const ranked = assignStandardRanks(rows);

        expect(ranked.map((entry) => entry.rank)).toEqual([1, 2, 2, 4]);
    });

    it("returns empty array for empty tournament", () => {
        expect(assignStandardRanks([])).toEqual([]);
    });
});

describe("getTournamentLeaderboard", () => {
    it("returns null when tournament not found", async () => {
        prisma.tournament.findUnique.mockResolvedValue(null);

        const result = await getTournamentLeaderboard("missing");

        expect(result).toBeNull();
    });

    it("returns ranked leaderboard for all group members", async () => {
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({
                id: "t1",
                groupId: "g1",
                exactScorePoints: 3,
                correctOutcomePoints: 1,
            }),
        );
        prisma.groupMember.findMany.mockResolvedValue([
            {
                ...makeGroupMember({ userId: "u1", groupId: "g1" }),
                user: makeUser({ id: "u1", name: "Alice" }),
            },
            {
                ...makeGroupMember({ userId: "u2", groupId: "g1" }),
                user: makeUser({ id: "u2", name: "Bob" }),
            },
        ] as unknown as (GroupMember & { user: User })[]);
        prisma.bet.findMany.mockResolvedValue([
            makeBet({ userId: "u1", betResult: BetResult.EXACT_SCORE }),
            makeBet({ userId: "u2", betResult: BetResult.CORRECT_OUTCOME }),
        ]);
        prisma.additionalBetEvent.findMany.mockResolvedValue([]);

        const result = await getTournamentLeaderboard("t1");

        expect(result).toEqual([
            {
                rank: 1,
                userId: "u1",
                name: "Alice",
                exactScoreBets: 1,
                correctOutcomeBets: 0,
                additionalBetPoints: 0,
                totalPoints: 3,
            },
            {
                rank: 2,
                userId: "u2",
                name: "Bob",
                exactScoreBets: 0,
                correctOutcomeBets: 1,
                additionalBetPoints: 0,
                totalPoints: 1,
            },
        ]);
    });

    it("includes additional bet points in leaderboard totals", async () => {
        prisma.tournament.findUnique.mockResolvedValue(
            makeTournament({
                id: "t1",
                groupId: "g1",
                exactScorePoints: 3,
                correctOutcomePoints: 1,
            }),
        );
        prisma.groupMember.findMany.mockResolvedValue([
            {
                ...makeGroupMember({ userId: "u1", groupId: "g1" }),
                user: makeUser({ id: "u1", name: "Alice" }),
            },
            {
                ...makeGroupMember({ userId: "u2", groupId: "g1" }),
                user: makeUser({ id: "u2", name: "Bob" }),
            },
        ] as unknown as (GroupMember & { user: User })[]);
        prisma.bet.findMany.mockResolvedValue([]);
        prisma.additionalBetEvent.findMany.mockResolvedValue([
            {
                id: "abe_1",
                points: 5,
                answer: "Poland",
                bets: [
                    {
                        eventId: "abe_1",
                        userId: "u1",
                        answer: "poland",
                    },
                ],
            },
        ] as never);

        const result = await getTournamentLeaderboard("t1");

        expect(result).toEqual([
            {
                rank: 1,
                userId: "u1",
                name: "Alice",
                exactScoreBets: 0,
                correctOutcomeBets: 0,
                additionalBetPoints: 5,
                totalPoints: 5,
            },
            {
                rank: 2,
                userId: "u2",
                name: "Bob",
                exactScoreBets: 0,
                correctOutcomeBets: 0,
                additionalBetPoints: 0,
                totalPoints: 0,
            },
        ]);
    });
});
