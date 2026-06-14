import type { FC } from "react";

import { Separator } from "@/components/ui/separator";

import { getAuthInApp } from "@/lib/auth/get-auth-in-app";

import { CreateTournamentDialog } from "@/features/tournament/components/create-tournament-dialog";
import { TournamentCard } from "@/features/tournament/components/tournament-card";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";

export const TournamentsOverviewLoading: FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-px w-full bg-border" />
            <div className="flex flex-col gap-3">
                <div className="h-16 animate-pulse rounded-lg bg-muted" />
                <div className="h-16 animate-pulse rounded-lg bg-muted" />
            </div>
            <p className="text-sm text-muted-foreground">Ładowanie…</p>
        </div>
    );
};

export const TournamentsOverview: FC = async () => {
    const session = await getAuthInApp();

    const sections = await listTournamentsForUser(session.user.id);
    if (sections.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Nie należysz jeszcze do żadnej grupy. Poproś administratora o
                zaproszenie.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {sections.map((section) => (
                <section key={section.groupId} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-heading text-lg font-semibold">
                            {section.groupName}
                        </h2>
                        {section.isAdmin ? (
                            <CreateTournamentDialog
                                groupId={section.groupId}
                                groupName={section.groupName}
                            />
                        ) : null}
                    </div>
                    <Separator />
                    {section.tournaments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Brak turniejów w tej grupie.
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {section.tournaments.map((t) => (
                                <li key={t.id} className="min-w-0">
                                    <TournamentCard
                                        tournamentId={t.id}
                                        name={t.name}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ))}
        </div>
    );
};
