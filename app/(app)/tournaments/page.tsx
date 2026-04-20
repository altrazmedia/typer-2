import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { TournamentsOverview } from "@/features/tournament/components/tournaments-overview";
import { listTournamentsForUser } from "@/features/tournament/server/list-tournaments-for-user";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sections = await listTournamentsForUser(session.user.id);

  return <TournamentsOverview sections={sections} />;
}
