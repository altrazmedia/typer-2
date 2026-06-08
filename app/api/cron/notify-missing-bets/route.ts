import { notifyMissingBets } from "@/features/pwa/api/notify-missing-bets";

export async function POST(request: Request) {
    return notifyMissingBets(request);
}

export async function GET(request: Request) {
    return notifyMissingBets(request);
}
