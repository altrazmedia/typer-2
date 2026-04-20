import "server-only";

import { NextResponse } from "next/server";

import { requireAuth, requireGroupAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

import { parseCreateTournamentBody } from "@/features/tournament/schema";

export async function createTournament(request: Request) {
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

  const parsed = parseCreateTournamentBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Podaj prawidłowe dane turnieju." },
      { status: 400 },
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: parsed.groupId },
  });
  if (!group) {
    return NextResponse.json({ error: "Grupa nie została znaleziona." }, { status: 404 });
  }

  const adminMembership = await requireGroupAdmin(parsed.groupId, session.user.id);
  if (!adminMembership) {
    return NextResponse.json(
      { error: "Brak uprawnień administratora tej grupy." },
      { status: 403 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.create({
      data: {
        groupId: parsed.groupId,
        name: parsed.name,
        season: parsed.season,
      },
    });
    const scoringRule = await tx.scoringRule.create({
      data: {
        tournamentId: tournament.id,
        exactScorePoints: parsed.exactScorePoints,
        correctOutcomePoints: parsed.correctOutcomePoints,
      },
    });
    return { tournament, scoringRule };
  });

  return NextResponse.json(
    {
      tournament: result.tournament,
      scoringRule: result.scoringRule,
    },
    { status: 201 },
  );
}
