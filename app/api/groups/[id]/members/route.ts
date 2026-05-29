import { addGroupMember } from "@/features/group/api/add-member";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
    return addGroupMember(request, context);
}
