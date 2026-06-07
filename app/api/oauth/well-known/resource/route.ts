import { getOauthProtectedResourceMetadata } from "@/features/oauth/api/well-known-resource";

export async function GET(req: Request) {
    return getOauthProtectedResourceMetadata(req);
}
