import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseResultBody(body: unknown): { homeScore: number; awayScore: number } | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const homeScore = o.homeScore;
  const awayScore = o.awayScore;
  if (typeof homeScore !== "number" || !Number.isInteger(homeScore)) return null;
  if (typeof awayScore !== "number" || !Number.isInteger(awayScore)) return null;
  if (homeScore < 0 || awayScore < 0) return null;
  return { homeScore, awayScore };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (!authResult.ok) {
    return authResult.response;
  }
  const { session } = authResult;

  const { id: gameId } = await context.params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });
  if (!game) {
    return NextResponse.json({ error: "Mecz nie został znaleziony." }, { status: 404 });
  }

  const adminResult = await requireTournamentAdmin(game.tournamentId, session.user.id);
  if (!adminResult.ok) {
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

  const parsed = parseResultBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Podaj prawidłowy wynik (liczby całkowite ≥ 0)." },
      { status: 400 },
    );
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      homeScore: parsed.homeScore,
      awayScore: parsed.awayScore,
    },
  });

  return NextResponse.json({ game: updated });
}
