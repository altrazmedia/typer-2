export interface TournamentListItem {
    id: string;
    name: string;
    season: string | null;
}

export interface TournamentGroupSection {
    groupId: string;
    groupName: string;
    isAdmin: boolean;
    tournaments: TournamentListItem[];
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    exactScoreBets: number;
    correctOutcomeBets: number;
    additionalBetPoints: number;
    totalPoints: number;
}

export interface AdditionalBetEventUserBet {
    userId: string;
    name: string;
    answer: string;
}

export interface AdditionalBetEventItem {
    id: string;
    tournamentId: string;
    name: string;
    deadline: Date;
    points: number;
    answer: string | null;
    createdAt: Date;
    currentUserBet: string | null;
    otherUsersBets: AdditionalBetEventUserBet[];
}
