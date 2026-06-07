import { registerOAuthClient } from "@/features/oauth/api/register";

export async function POST(req: Request) {
    return registerOAuthClient(req);
}
