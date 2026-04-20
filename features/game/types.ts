export interface GameRow {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  homeScore: number | null;
  awayScore: number | null;
}
