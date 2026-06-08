import { subscribePush, unsubscribePush } from "@/features/pwa/api/subscribe";

export async function POST(request: Request) {
    return subscribePush(request);
}

export async function DELETE(request: Request) {
    return unsubscribePush(request);
}
