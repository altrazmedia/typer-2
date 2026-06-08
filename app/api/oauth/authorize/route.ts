import { handleAuthorizeSubmit } from "@/features/oauth/api/authorize";

export async function POST(req: Request) {
    return handleAuthorizeSubmit(req);
}
