import { createTournament } from "@/features/tournament/api/create-tournament";

export async function POST(request: Request) {
    return createTournament(request);
}
