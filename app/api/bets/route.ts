import { placeBet } from "@/features/bet/api/place-bet";

export async function POST(request: Request) {
  return placeBet(request);
}
