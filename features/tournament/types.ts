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
    totalPoints: number;
}
