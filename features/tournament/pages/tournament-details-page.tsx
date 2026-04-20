import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { TournamentDetailView } from "@/features/tournament/components/tournament-detail";
import { getTournamentDetailForUser } from "@/features/tournament/server/get-tournament-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function TournamentDetailsPage({ params }: Props) {
  const { id: tournamentId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const detail = await getTournamentDetailForUser(tournamentId, session.user.id);
  if (!detail) {
    notFound();
  }

  return <TournamentDetailView detail={detail} />;
}
