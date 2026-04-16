import { NextResponse } from "next/server";

import { requireAuth, requireGroupAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseBody(body: unknown): { name: string } | null {
  if (!body || typeof body !== "object") return null;
  const name = (body as { name?: unknown }).name;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return { name: trimmed };
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

  const { id: groupId } = await context.params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });
  if (!group) {
    return NextResponse.json({ error: "Grupa nie została znaleziona." }, { status: 404 });
  }

  const adminMembership = await requireGroupAdmin(groupId, session.user.id);
  if (!adminMembership) {
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

  const parsed = parseBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Podaj prawidłową nazwę grupy." },
      { status: 400 },
    );
  }

  const updated = await prisma.group.update({
    where: { id: groupId },
    data: { name: parsed.name },
  });

  return NextResponse.json({ group: updated });
}
