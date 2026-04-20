import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseCreateBody(body: unknown): {
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
} | null {
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

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.ok) {
    return authResult.response;
  }
  const { session } = authResult;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowy format żądania." },
      { status: 400 },
    );
  }

  const parsed = parseCreateBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Podaj prawidłowe dane meczu." },
      { status: 400 },
    );
  }

  const adminResult = await requireTournamentAdmin(
    parsed.tournamentId,
    session.user.id,
  );
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

  const game = await prisma.game.create({
    data: {
      tournamentId: parsed.tournamentId,
      homeTeam: parsed.homeTeam,
      awayTeam: parsed.awayTeam,
      kickoffAt: parsed.kickoffAt,
    },
  });

  return NextResponse.json({ game }, { status: 201 });
}
