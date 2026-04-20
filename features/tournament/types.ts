export interface TournamentListItem {
  id: string;
  name: string;
  season: string | null;
  gameCount: number;
}

export interface TournamentGroupSection {
  groupId: string;
  groupName: string;
  isAdmin: boolean;
  tournaments: TournamentListItem[];
}
