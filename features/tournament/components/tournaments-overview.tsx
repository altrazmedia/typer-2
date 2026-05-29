import type { FC } from "react";

import { Separator } from "@/components/ui/separator";

import { CreateTournamentDialog } from "@/features/tournament/components/create-tournament-dialog";
import { TournamentCard } from "@/features/tournament/components/tournament-card";
import type { TournamentGroupSection } from "@/features/tournament/types";

interface Props {
    sections: TournamentGroupSection[];
}

export const TournamentsOverview: FC<Props> = ({ sections }) => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Turnieje
                </h1>
                <p className="text-muted-foreground">
                    Przeglądaj turnieje w grupach, do których należysz.
                </p>
            </div>

            {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Nie należysz jeszcze do żadnej grupy. Poproś administratora
                    o zaproszenie.
                </p>
            ) : (
                <div className="flex flex-col gap-10">
                    {sections.map((section) => (
                        <section
                            key={section.groupId}
                            className="flex flex-col gap-4"
                        >
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
                                        <li key={t.id}>
                                            <TournamentCard
                                                tournamentId={t.id}
                                                name={t.name}
                                                season={t.season}
                                                gameCount={t.gameCount}
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
};
