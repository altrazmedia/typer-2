import { updateGroup } from "@/features/group/api/update-group";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
    return updateGroup(request, context);
}
