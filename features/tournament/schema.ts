export type CreateTournamentInput = {
    groupId: string;
    name: string;
    season: string | null;
    exactScorePoints: number;
    correctOutcomePoints: number;
};

export type UpdateTournamentInput = {
    name?: string;
    season?: string | null;
    exactScorePoints?: number;
    correctOutcomePoints?: number;
};

export function parseCreateTournamentBody(
    body: unknown,
): CreateTournamentInput | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    const groupId = o.groupId;
    const name = o.name;
    if (typeof groupId !== "string" || !groupId.trim()) return null;
    if (typeof name !== "string") return null;
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    let season: string | null = null;
    if (o.season !== undefined && o.season !== null) {
        if (typeof o.season !== "string") return null;
        const s = o.season.trim();
        season = s.length ? s : null;
    }

    let exactScorePoints = 3;
    if (o.exactScorePoints !== undefined) {
        if (
            typeof o.exactScorePoints !== "number" ||
            !Number.isInteger(o.exactScorePoints)
        ) {
            return null;
        }
        if (o.exactScorePoints < 0) return null;
        exactScorePoints = o.exactScorePoints;
    }

    let correctOutcomePoints = 1;
    if (o.correctOutcomePoints !== undefined) {
        if (
            typeof o.correctOutcomePoints !== "number" ||
            !Number.isInteger(o.correctOutcomePoints)
        ) {
            return null;
        }
        if (o.correctOutcomePoints < 0) return null;
        correctOutcomePoints = o.correctOutcomePoints;
    }

    return {
        groupId: groupId.trim(),
        name: trimmedName,
        season,
        exactScorePoints,
        correctOutcomePoints,
    };
}

export function parseUpdateTournamentBody(
    body: unknown,
): UpdateTournamentInput | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    const out: UpdateTournamentInput = {};

    if (o.name !== undefined) {
        if (typeof o.name !== "string") return null;
        const trimmed = o.name.trim();
        if (!trimmed) return null;
        out.name = trimmed;
    }

    if (o.season !== undefined) {
        if (o.season === null) {
            out.season = null;
        } else if (typeof o.season === "string") {
            const s = o.season.trim();
            out.season = s.length ? s : null;
        } else {
            return null;
        }
    }

    if (o.exactScorePoints !== undefined) {
        if (
            typeof o.exactScorePoints !== "number" ||
            !Number.isInteger(o.exactScorePoints)
        ) {
            return null;
        }
        if (o.exactScorePoints < 0) return null;
        out.exactScorePoints = o.exactScorePoints;
    }

    if (o.correctOutcomePoints !== undefined) {
        if (
            typeof o.correctOutcomePoints !== "number" ||
            !Number.isInteger(o.correctOutcomePoints)
        ) {
            return null;
        }
        if (o.correctOutcomePoints < 0) return null;
        out.correctOutcomePoints = o.correctOutcomePoints;
    }

    if (
        out.name === undefined &&
        out.season === undefined &&
        out.exactScorePoints === undefined &&
        out.correctOutcomePoints === undefined
    ) {
        return null;
    }

    return out;
}
