import { submitGameResult } from "@/features/game/api/submit-result";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
    return submitGameResult(request, context);
}
