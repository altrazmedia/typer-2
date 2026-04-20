import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseUpdateBody(body: unknown): {
  name?: string;
  season?: string | null;
  exactScorePoints?: number;
  correctOutcomePoints?: number;
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const out: {
    name?: string;
    season?: string | null;
    exactScorePoints?: number;
    correctOutcomePoints?: number;
  } = {};

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
    if (typeof o.exactScorePoints !== "number" || !Number.isInteger(o.exactScorePoints)) {
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (!authResult.ok) {
    return authResult.response;
  }
  const { session } = authResult;

  const { id: tournamentId } = await context.params;

  const adminResult = await requireTournamentAdmin(tournamentId, session.user.id);
  if (!adminResult.ok) {
    if (adminResult.reason === "not_found") {
      return NextResponse.json(
        { error: "Turniej nie został znaleziony." },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Brak uprawnień administratora tej grupy." },
      { status: 403 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowy format żądania." },
      { status: 400 },
    );
  }

  const parsed = parseUpdateBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Podaj co najmniej jedno pole do aktualizacji." },
      { status: 400 },
    );
  }

  const { tournament, scoringRule } = await prisma.$transaction(async (tx) => {
    const tournamentUpdate: { name?: string; season?: string | null } = {};
    if (parsed.name !== undefined) tournamentUpdate.name = parsed.name;
    if (parsed.season !== undefined) tournamentUpdate.season = parsed.season;

    const updatedTournament =
      Object.keys(tournamentUpdate).length > 0
        ? await tx.tournament.update({
            where: { id: tournamentId },
            data: tournamentUpdate,
          })
        : await tx.tournament.findUniqueOrThrow({ where: { id: tournamentId } });

    let scoringRule = await tx.scoringRule.findUnique({
      where: { tournamentId },
    });

    if (
      parsed.exactScorePoints !== undefined ||
      parsed.correctOutcomePoints !== undefined
    ) {
      scoringRule = await tx.scoringRule.upsert({
        where: { tournamentId },
        create: {
          tournamentId,
          exactScorePoints: parsed.exactScorePoints ?? 3,
          correctOutcomePoints: parsed.correctOutcomePoints ?? 1,
        },
        update: {
          ...(parsed.exactScorePoints !== undefined
            ? { exactScorePoints: parsed.exactScorePoints }
            : {}),
          ...(parsed.correctOutcomePoints !== undefined
            ? { correctOutcomePoints: parsed.correctOutcomePoints }
            : {}),
        },
      });
    }

    return { tournament: updatedTournament, scoringRule };
  });

  return NextResponse.json({ tournament, scoringRule });
}
