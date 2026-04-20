import { describe, expect, it } from "vitest";

import { createGame } from "@/features/game/api/create-game";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeGame, makeGroupMember, makeTournament } from "@/test/factories";
import { prisma } from "@/test/prisma";
import { makeInvalidJsonRequest, makeJsonRequest } from "@/test/request";
import { readJson } from "@/test/response";

describe("createGame", () => {
  it("returns 401 when unauthenticated", async () => {
    mockUnauthed();
    const req = makeJsonRequest({
      tournamentId: "t1",
      homeTeam: "A",
      awayTeam: "B",
      kickoffAt: new Date().toISOString(),
    });
    const res = await createGame(req);
    const { status, body } = await readJson(res);
    expect(status).toBe(401);
    expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
  });

  it("returns 400 when JSON is invalid", async () => {
    mockAuthedUser({ id: "u1" });
    const res = await createGame(makeInvalidJsonRequest());
    const { status, body } = await readJson(res);
    expect(status).toBe(400);
    expect(body).toEqual({ error: "Nieprawidłowy format żądania." });
  });

  it("returns 400 when body fails validation", async () => {
    mockAuthedUser({ id: "u1" });
    const req = makeJsonRequest({
      tournamentId: "",
      homeTeam: "A",
      awayTeam: "B",
      kickoffAt: new Date().toISOString(),
    });
    const res = await createGame(req);
    const { status, body } = await readJson(res);
    expect(status).toBe(400);
    expect(body).toEqual({ error: "Podaj prawidłowe dane meczu." });
  });

  it("returns 404 when tournament not found", async () => {
    mockAuthedUser({ id: "u1" });
    prisma.tournament.findUnique.mockResolvedValue(null);
    const req = makeJsonRequest({
      tournamentId: "missing",
      homeTeam: "A",
      awayTeam: "B",
      kickoffAt: new Date().toISOString(),
    });
    const res = await createGame(req);
    const { status, body } = await readJson(res);
    expect(status).toBe(404);
    expect(body).toEqual({ error: "Turniej nie został znaleziony." });
  });

  it("returns 403 when user is not group admin", async () => {
    mockAuthedUser({ id: "u1" });
    prisma.tournament.findUnique.mockResolvedValue(makeTournament());
    prisma.groupMember.findFirst.mockResolvedValue(null);
    const req = makeJsonRequest({
      tournamentId: "tournament_test_1",
      homeTeam: "A",
      awayTeam: "B",
      kickoffAt: new Date().toISOString(),
    });
    const res = await createGame(req);
    const { status, body } = await readJson(res);
    expect(status).toBe(403);
    expect(body).toEqual({
      error: "Brak uprawnień administratora tej grupy.",
    });
  });

  it("returns 201 and created game when admin", async () => {
    mockAuthedUser({ id: "u1" });
    prisma.tournament.findUnique.mockResolvedValue(makeTournament());
    prisma.groupMember.findFirst.mockResolvedValue(
      makeGroupMember({ isAdmin: true }),
    );
    const created = makeGame({
      id: "new_game",
      homeTeam: "A",
      awayTeam: "B",
    });
    prisma.game.create.mockResolvedValue(created);

    const kickoffAt = new Date("2026-07-01T20:00:00.000Z");
    const req = makeJsonRequest({
      tournamentId: "tournament_test_1",
      homeTeam: "A",
      awayTeam: "B",
      kickoffAt: kickoffAt.toISOString(),
    });
    const res = await createGame(req);
    const { status, body } = await readJson(res);
    expect(status).toBe(201);
    // NextResponse.json serializes Date fields to ISO strings.
    expect(body).toEqual(JSON.parse(JSON.stringify({ game: created })));
    expect(prisma.game.create).toHaveBeenCalledWith({
      data: {
        tournamentId: "tournament_test_1",
        homeTeam: "A",
        awayTeam: "B",
        kickoffAt,
      },
    });
  });
});
