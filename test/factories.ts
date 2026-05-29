import type {
    Bet,
    Game,
    Group,
    GroupMember,
    Tournament,
    User,
} from "@prisma/client";

export function makeUser(overrides: Partial<User> = {}): User {
    const now = new Date();
    return {
        id: "user_test_1",
        email: "user@test.dev",
        passwordHash: "hash",
        name: "Test User",
        createdAt: now,
        ...overrides,
    };
}

export function makeGroup(overrides: Partial<Group> = {}): Group {
    const now = new Date();
    return {
        id: "group_test_1",
        name: "Test Group",
        createdAt: now,
        createdBy: "user_test_1",
        ...overrides,
    };
}

export function makeGroupMember(
    overrides: Partial<GroupMember> = {},
): GroupMember {
    const now = new Date();
    return {
        id: "gm_test_1",
        groupId: "group_test_1",
        userId: "user_test_1",
        isAdmin: false,
        joinedAt: now,
        ...overrides,
    };
}

export function makeTournament(
    overrides: Partial<Tournament> = {},
): Tournament {
    const now = new Date();
    return {
        id: "tournament_test_1",
        groupId: "group_test_1",
        name: "Test Tournament",
        season: null,
        createdAt: now,
        ...overrides,
    };
}

export function makeGame(overrides: Partial<Game> = {}): Game {
    const now = new Date();
    return {
        id: "game_test_1",
        tournamentId: "tournament_test_1",
        homeTeam: "Home FC",
        awayTeam: "Away FC",
        kickoffAt: now,
        homeScore: null,
        awayScore: null,
        createdAt: now,
        ...overrides,
    };
}

export function makeBet(overrides: Partial<Bet> = {}): Bet {
    const now = new Date();
    return {
        id: "bet_test_1",
        gameId: "game_test_1",
        userId: "user_test_1",
        homeScore: 1,
        awayScore: 1,
        pointsAwarded: null,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}
