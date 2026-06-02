import { getLeaderboard } from "@/features/tournament/api/get-leaderboard";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
    return getLeaderboard(request, context);
}
