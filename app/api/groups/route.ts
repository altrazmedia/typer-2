import { createGroup } from "@/features/group/api/create-group";

export async function POST(request: Request) {
    return createGroup(request);
}
