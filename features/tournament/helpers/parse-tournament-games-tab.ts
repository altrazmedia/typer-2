export type TournamentGamesTab =
    | "additional-bets"
    | "finished"
    | "leaderboard"
    | "upcoming";

function firstString(value: string | string[] | undefined): string | undefined {
    if (value === undefined) return undefined;
    return Array.isArray(value) ? value[0] : value;
}

export function parseTournamentGamesTab(
    tab: string | string[] | undefined,
): TournamentGamesTab {
    const v = firstString(tab);
    if (v === "finished") return "finished";
    if (v === "additional-bets") return "additional-bets";
    if (v === "leaderboard") return "leaderboard";
    return "upcoming";
}
