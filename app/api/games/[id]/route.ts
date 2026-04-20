import { updateGame } from "@/features/game/api/update-game";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  return updateGame(request, context);
}
