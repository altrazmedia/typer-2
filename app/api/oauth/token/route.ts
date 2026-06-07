import { handleTokenRequest } from "@/features/oauth/api/token";

export async function POST(req: Request) {
    return handleTokenRequest(req);
}
