import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("password", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            name: "Test Admin",
            passwordHash,
        },
    });

    const group = await prisma.group.upsert({
        where: { id: "seed-group-typer" },
        update: {},
        create: {
            id: "seed-group-typer",
            name: "Friends League",
            createdBy: admin.id,
            members: {
                create: {
                    userId: admin.id,
                    isAdmin: true,
                },
            },
        },
    });

    const tournament = await prisma.tournament.upsert({
        where: { id: "seed-tournament-wc" },
        update: {},
        create: {
            id: "seed-tournament-wc",
            groupId: group.id,
            name: "World Cup 2026",
            season: "2026",
            scoringRule: {
                create: {
                    exactScorePoints: 3,
                    correctOutcomePoints: 1,
                },
            },
        },
        include: { scoringRule: true },
    });

    const kickoff1 = new Date("2026-06-15T18:00:00.000Z");
    const kickoff2 = new Date("2026-06-16T20:00:00.000Z");

    await prisma.game.upsert({
        where: { id: "seed-game-1" },
        update: {},
        create: {
            id: "seed-game-1",
            tournamentId: tournament.id,
            homeTeam: "Team A",
            awayTeam: "Team B",
            kickoffAt: kickoff1,
        },
    });

    await prisma.game.upsert({
        where: { id: "seed-game-2" },
        update: {},
        create: {
            id: "seed-game-2",
            tournamentId: tournament.id,
            homeTeam: "Team C",
            awayTeam: "Team D",
            kickoffAt: kickoff2,
        },
    });

    console.log("Seed complete:", {
        adminEmail: admin.email,
        groupId: group.id,
        tournamentId: tournament.id,
        scoringRuleId: tournament.scoringRule?.id,
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
