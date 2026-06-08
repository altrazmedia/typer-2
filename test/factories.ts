import type {
    Bet,
    Game,
    Group,
    GroupMember,
    OAuthClient,
    OAuthCode,
    PushSubscription,
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
        exactScorePoints: 3,
        correctOutcomePoints: 1,
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
        betResult: null,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

export function makeOAuthClient(
    overrides: Partial<OAuthClient> = {},
): OAuthClient {
    const now = new Date();
    return {
        id: "client_test_1",
        clientName: "Test Client",
        redirectUris: ["http://localhost:3001/callback"],
        createdAt: now,
        ...overrides,
    };
}

export function makeOAuthCode(overrides: Partial<OAuthCode> = {}): OAuthCode {
    const now = new Date();
    return {
        id: "code_test_1",
        clientId: "client_test_1",
        userId: "user_test_1",
        code: "test_auth_code_value",
        redirectUri: "http://localhost:3001/callback",
        codeChallenge: "test_challenge",
        codeChallengeMethod: "S256",
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
        used: false,
        createdAt: now,
        ...overrides,
    };
}

export function makePushSubscription(
    overrides: Partial<PushSubscription> = {},
): PushSubscription {
    const now = new Date();
    return {
        id: "push_sub_test_1",
        userId: "user_test_1",
        endpoint: "https://push.example/subscription-1",
        p256dh: "test_p256dh_key",
        auth: "test_auth_key",
        createdAt: now,
        ...overrides,
    };
}
