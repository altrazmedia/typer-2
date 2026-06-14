interface CacheTags {
    leaderboard: { tournamentId: string };
    "tournaments-for-group": { groupId: string };
}

type TagWithParams = {
    [K in keyof CacheTags]: CacheTags[K] extends never ? never : K;
}[keyof CacheTags];

type TagWithoutParams = {
    [K in keyof CacheTags]: CacheTags[K] extends never ? K : never;
}[keyof CacheTags];

function buildCacheTagString(
    id: string,
    params: Record<string, string>,
): string {
    const keys = Object.keys(params).sort();
    const values = keys.map((key) => params[key]);
    return [id, ...values].join(":");
}

export function getCacheTag<T extends TagWithParams>(
    id: T,
    params: CacheTags[T],
): string;
export function getCacheTag(id: TagWithoutParams): string;
export function getCacheTag(
    id: keyof CacheTags,
    params?: Record<string, string>,
): string {
    if (params === undefined) {
        return id;
    }

    return buildCacheTagString(id, params);
}
