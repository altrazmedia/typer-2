import type {
    GameBetRow,
    GameBetTableRow,
    GroupMemberRow,
} from "@/features/game/types";

export function buildGameBetRows(
    members: GroupMemberRow[],
    bets: GameBetRow[],
    currentUserId: string,
): GameBetTableRow[] {
    const betsByUserId = new Map(bets.map((bet) => [bet.userId, bet]));

    const rows = members.map((member) => {
        const bet = betsByUserId.get(member.userId);

        return {
            userId: member.userId,
            name: member.name,
            isCurrentUser: member.userId === currentUserId,
            homeScore: bet?.homeScore ?? null,
            awayScore: bet?.awayScore ?? null,
            betResult: bet?.betResult ?? null,
        };
    });

    const currentUserRows = rows.filter((row) => row.isCurrentUser);
    const otherRows = rows
        .filter((row) => !row.isCurrentUser)
        .sort((a, b) => a.name.localeCompare(b.name, "pl"));

    return [...currentUserRows, ...otherRows];
}
