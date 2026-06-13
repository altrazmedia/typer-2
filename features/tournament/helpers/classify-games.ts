import dayjs from "dayjs";

export function classifyGames<T extends { kickoffAt: Date }>(
    games: T[],
    now: Date,
): { finished: T[]; upcoming: T[] } {
    const finished: T[] = [];
    const upcoming: T[] = [];

    for (const game of games) {
        if (dayjs(game.kickoffAt).isAfter(dayjs(now))) {
            upcoming.push(game);
        } else {
            finished.push(game);
        }
    }

    finished.sort((a, b) => dayjs(b.kickoffAt).diff(dayjs(a.kickoffAt)));
    upcoming.sort((a, b) => dayjs(a.kickoffAt).diff(dayjs(b.kickoffAt)));

    return { finished, upcoming };
}
