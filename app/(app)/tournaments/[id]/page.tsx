import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { CreateGameDialog } from "@/components/create-game-dialog";
import { EditTournamentDialog } from "@/components/edit-tournament-dialog";
import { GameCard } from "@/components/game-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id: tournamentId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      scoringRule: true,
      games: { orderBy: { kickoffAt: "asc" } },
      group: true,
    },
  });

  if (!tournament) {
    notFound();
  }

  const membership = await prisma.groupMember.findFirst({
    where: {
      userId: session.user.id,
      groupId: tournament.groupId,
    },
  });

  if (!membership) {
    notFound();
  }

  const isAdmin = membership.isAdmin;

  const exactPts = tournament.scoringRule?.exactScorePoints ?? 3;
  const outcomePts = tournament.scoringRule?.correctOutcomePoints ?? 1;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{tournament.group.name}</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {tournament.name}
          </h1>
          {tournament.season ? (
            <p className="text-muted-foreground">Sezon: {tournament.season}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Punktacja: {exactPts} pkt za dokładny wynik, {outcomePts} pkt za trafiony wynik
          </p>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <EditTournamentDialog
              tournamentId={tournament.id}
              initialName={tournament.name}
              initialSeason={tournament.season}
              initialExactScorePoints={exactPts}
              initialCorrectOutcomePoints={outcomePts}
            />
            <CreateGameDialog tournamentId={tournament.id} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Mecze</h2>
        {tournament.games.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zaplanowanych meczów.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {tournament.games.map((game) => (
              <li key={game.id}>
                <GameCard
                  game={{
                    id: game.id,
                    homeTeam: game.homeTeam,
                    awayTeam: game.awayTeam,
                    kickoffAt: game.kickoffAt,
                    homeScore: game.homeScore,
                    awayScore: game.awayScore,
                  }}
                  isAdmin={isAdmin}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
