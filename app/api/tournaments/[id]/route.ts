import { updateTournament } from "@/features/tournament/api/update-tournament";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  return updateTournament(request, context);
}
