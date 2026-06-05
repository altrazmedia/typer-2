import { regenerateApiKey } from "@/features/auth/api/regenerate-api-key";

export async function POST() {
    return regenerateApiKey();
}
