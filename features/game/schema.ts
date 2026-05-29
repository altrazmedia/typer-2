export type CreateGameInput = {
    tournamentId: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: Date;
};

export type UpdateGameInput = {
    homeTeam?: string;
    awayTeam?: string;
    kickoffAt?: Date;
};

export type SubmitResultInput = {
    homeScore: number;
    awayScore: number;
};

export function parseCreateGameBody(body: unknown): CreateGameInput | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    const tournamentId = o.tournamentId;
    const homeTeam = o.homeTeam;
    const awayTeam = o.awayTeam;
    const kickoffAtRaw = o.kickoffAt;

    if (typeof tournamentId !== "string" || !tournamentId.trim()) return null;
    if (typeof homeTeam !== "string" || !homeTeam.trim()) return null;
    if (typeof awayTeam !== "string" || !awayTeam.trim()) return null;
    if (typeof kickoffAtRaw !== "string" || !kickoffAtRaw.trim()) return null;

    const kickoffAt = new Date(kickoffAtRaw);
    if (Number.isNaN(kickoffAt.getTime())) return null;

    return {
        tournamentId: tournamentId.trim(),
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        kickoffAt,
    };
}

export function parseUpdateGameBody(body: unknown): UpdateGameInput | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    const out: UpdateGameInput = {};

    if (o.homeTeam !== undefined) {
        if (typeof o.homeTeam !== "string") return null;
        const t = o.homeTeam.trim();
        if (!t) return null;
        out.homeTeam = t;
    }
    if (o.awayTeam !== undefined) {
        if (typeof o.awayTeam !== "string") return null;
        const t = o.awayTeam.trim();
        if (!t) return null;
        out.awayTeam = t;
    }
    if (o.kickoffAt !== undefined) {
        if (typeof o.kickoffAt !== "string") return null;
        const d = new Date(o.kickoffAt);
        if (Number.isNaN(d.getTime())) return null;
        out.kickoffAt = d;
    }

    if (
        out.homeTeam === undefined &&
        out.awayTeam === undefined &&
        out.kickoffAt === undefined
    ) {
        return null;
    }

    return out;
}

export function parseSubmitResultBody(body: unknown): SubmitResultInput | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    const homeScore = o.homeScore;
    const awayScore = o.awayScore;
    if (typeof homeScore !== "number" || !Number.isInteger(homeScore))
        return null;
    if (typeof awayScore !== "number" || !Number.isInteger(awayScore))
        return null;
    if (homeScore < 0 || awayScore < 0) return null;
    return { homeScore, awayScore };
}
