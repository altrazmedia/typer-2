import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAuthInApp } from "@/lib/auth/get-auth-in-app";

import {
    TournamentHeader,
    TournamentHeaderLoading,
} from "@/features/tournament/components/tournament-header";
import { getTournamentMembership } from "@/features/tournament/server/get-tournament-membership";

interface Props {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export async function TournamentDetailsLayout({
    children,
    params,
}: Props): Promise<React.ReactElement> {
    const { id: tournamentId } = await params;
    const session = await getAuthInApp();

    const membership = await getTournamentMembership(
        tournamentId,
        session.user.id,
    );
    if (!membership) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <Suspense fallback={<TournamentHeaderLoading />}>
                <TournamentHeader
                    isAdmin={membership.isAdmin}
                    tournamentId={tournamentId}
                />
            </Suspense>
            {children}
        </div>
    );
}
