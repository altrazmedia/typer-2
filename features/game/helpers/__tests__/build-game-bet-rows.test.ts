import { describe, expect, it } from "vitest";

import { buildGameBetRows } from "@/features/game/helpers/build-game-bet-rows";
import type { GameBetRow, GroupMemberRow } from "@/features/game/types";

const members: GroupMemberRow[] = [
    { userId: "u1", name: "Jan Kowalski" },
    { userId: "u2", name: "Anna Nowak" },
    { userId: "u3", name: "Łukasz Zieliński" },
    { userId: "u4", name: "Beata Adamska" },
];

describe("buildGameBetRows", () => {
    it("places the current user first and sorts others alphabetically (pl locale)", () => {
        const rows = buildGameBetRows(members, [], "u3");

        expect(rows.map((row) => row.userId)).toEqual(["u3", "u2", "u4", "u1"]);
    });

    it("includes every group member even when only some placed bets", () => {
        const bets: GameBetRow[] = [
            {
                userId: "u1",
                homeScore: 2,
                awayScore: 1,
                betResult: null,
            },
            {
                userId: "u3",
                homeScore: 0,
                awayScore: 0,
                betResult: null,
            },
        ];

        const rows = buildGameBetRows(members, bets, "u2");

        expect(rows).toHaveLength(4);
        expect(rows[0]).toMatchObject({
            userId: "u2",
            homeScore: null,
            awayScore: null,
        });
        expect(rows.find((row) => row.userId === "u1")).toMatchObject({
            homeScore: 2,
            awayScore: 1,
        });
        expect(rows.find((row) => row.userId === "u3")).toMatchObject({
            homeScore: 0,
            awayScore: 0,
        });
    });

    it("marks the current user and leaves prediction empty when they did not bet", () => {
        const rows = buildGameBetRows(members, [], "u1");

        expect(rows[0]).toEqual({
            userId: "u1",
            name: "Jan Kowalski",
            isCurrentUser: true,
            homeScore: null,
            awayScore: null,
        });
        expect(rows[1]?.isCurrentUser).toBe(false);
    });
});
