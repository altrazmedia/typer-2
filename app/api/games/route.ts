import { createGame } from "@/features/game/api/create-game";

export async function POST(request: Request) {
    return createGame(request);
}
