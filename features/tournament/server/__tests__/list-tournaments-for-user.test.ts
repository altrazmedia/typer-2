import { cacheTag } from "next/cache";
import { describe, expect, it } from "vitest";

import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/test/prisma";

describe("listTournamentsForUser", () => {
    it("returns tournament sections grouped by membership", async () => {
        prisma.groupMember.findMany.mockResolvedValue([
            {
                groupId: "group_1",
                isAdmin: true,
                group: {
                    name: "Grupa testowa",
                    tournaments: [
                        {
                            id: "t1",
                            name: "Liga 2026",
                            season: "2025/26",
                        },
                    ],
                },
            },
        ] as never);

        const result = await listTournamentsForUser("user_1");

        expect(result).toEqual([
            {
                groupId: "group_1",
                groupName: "Grupa testowa",
                isAdmin: true,
                tournaments: [
                    {
                        id: "t1",
                        name: "Liga 2026",
                        season: "2025/26",
                    },
                ],
            },
        ]);
    });

    it("returns an empty list when the user has no group memberships", async () => {
        prisma.groupMember.findMany.mockResolvedValue([]);

        const result = await listTournamentsForUser("user_1");

        expect(result).toEqual([]);
    });

    it("applies a cache tag per group membership", async () => {
        prisma.groupMember.findMany.mockResolvedValue([
            {
                groupId: "group_1",
                isAdmin: false,
                group: { name: "Grupa A", tournaments: [] },
            },
            {
                groupId: "group_2",
                isAdmin: false,
                group: { name: "Grupa B", tournaments: [] },
            },
        ] as never);

        await listTournamentsForUser("user_1");

        expect(cacheTag).toHaveBeenCalledWith(
            getCacheTag("tournaments-for-group", { groupId: "group_1" }),
            getCacheTag("tournaments-for-group", { groupId: "group_2" }),
        );
    });
});
