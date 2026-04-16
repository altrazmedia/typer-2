import { NextResponse } from "next/server";

import { requireAuth, requireGroupAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

function parseBody(body: unknown): { email: string } | null {
  if (!body || typeof body !== "object") return null;
  const email = (body as { email?: unknown }).email;
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  return { email: trimmed };
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
      { error: "Podaj prawidłowy adres e-mail." },
      { status: 400 },
    );
  }

  const userToAdd = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (!userToAdd) {
    return NextResponse.json(
      { error: "Użytkownik o podanym adresie e-mail nie jest zarejestrowany." },
      { status: 404 },
    );
  }

  const existing = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: userToAdd.id },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Użytkownik jest już członkiem tej grupy." },
      { status: 409 },
    );
  }

  const groupMember = await prisma.groupMember.create({
    data: {
      groupId,
      userId: userToAdd.id,
      isAdmin: false,
    },
  });

  return NextResponse.json({ groupMember });
}
