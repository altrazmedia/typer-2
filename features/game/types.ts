import type { BetResult } from "@prisma/client";

export interface GameParams {
    homeTeam: string;
    awayTeam: string;
    kickoffAt: string;
}

export interface GameRow {
    id: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: Date;
    homeScore: number | null;
    awayScore: number | null;
}

export interface GroupMemberRow {
    userId: string;
    name: string;
}

export interface GameBetRow {
    userId: string;
    homeScore: number;
    awayScore: number;
    betResult: BetResult | null;
}

export interface GameBetTableRow {
    userId: string;
    name: string;
    isCurrentUser: boolean;
    homeScore: number | null;
    awayScore: number | null;
    betResult: BetResult | null;
}
