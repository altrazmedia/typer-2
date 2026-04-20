import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseUpdateBody(body: unknown): {
  homeTeam?: string;
  awayTeam?: string;
  kickoffAt?: Date;
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const out: {
    homeTeam?: string;
    awayTeam?: string;
    kickoffAt?: Date;
  } = {};

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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
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

  const parsed = parseUpdateBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Podaj co najmniej jedno pole do aktualizacji." },
      { status: 400 },
    );
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      ...(parsed.homeTeam !== undefined ? { homeTeam: parsed.homeTeam } : {}),
      ...(parsed.awayTeam !== undefined ? { awayTeam: parsed.awayTeam } : {}),
      ...(parsed.kickoffAt !== undefined ? { kickoffAt: parsed.kickoffAt } : {}),
    },
  });

  return NextResponse.json({ game: updated });
}
