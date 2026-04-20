import { NextResponse } from "next/server";

import { requireAuth, requireGroupAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseCreateBody(body: unknown): {
  groupId: string;
  name: string;
  season: string | null;
  exactScorePoints: number;
  correctOutcomePoints: number;
} | null {
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
    if (typeof o.exactScorePoints !== "number" || !Number.isInteger(o.exactScorePoints)) {
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
