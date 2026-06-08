import { getOauthAuthorizationServerMetadata } from "@/features/oauth/api/well-known-auth-server";

export async function GET(req: Request) {
    return getOauthAuthorizationServerMetadata(req);
}
