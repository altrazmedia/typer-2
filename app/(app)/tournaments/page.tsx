import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

import { CreateTournamentDialog } from "@/components/create-tournament-dialog";
import { Separator } from "@/components/ui/separator";
import { TournamentCard } from "@/components/tournament-card";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          tournaments: {
            orderBy: { createdAt: "desc" },
            include: {
              _count: { select: { games: true } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Turnieje</h1>
        <p className="text-muted-foreground">
          Przeglądaj turnieje w grupach, do których należysz.
        </p>
      </div>

      {memberships.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nie należysz jeszcze do żadnej grupy. Poproś administratora o zaproszenie.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {memberships.map((m) => (
            <section key={m.groupId} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-heading text-lg font-semibold">{m.group.name}</h2>
                {m.isAdmin ? (
                  <CreateTournamentDialog groupId={m.groupId} groupName={m.group.name} />
                ) : null}
              </div>
              <Separator />
              {m.group.tournaments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak turniejów w tej grupie.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {m.group.tournaments.map((t) => (
                    <li key={t.id}>
                      <TournamentCard
                        tournamentId={t.id}
                        name={t.name}
                        season={t.season}
                        gameCount={t._count.games}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
