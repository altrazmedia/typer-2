export function classifyGames<T extends { kickoffAt: Date }>(
    games: T[],
    now: Date,
): { finished: T[]; upcoming: T[] } {
    const finished: T[] = [];
    const nowMs = now.getTime();
    const upcoming: T[] = [];

    for (const game of games) {
        if (game.kickoffAt.getTime() > nowMs) {
            upcoming.push(game);
        } else {
            finished.push(game);
        }
    }

    finished.sort((a, b) => b.kickoffAt.getTime() - a.kickoffAt.getTime());
    upcoming.sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime());

    return { finished, upcoming };
}
