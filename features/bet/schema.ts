export type PlaceBetInput = {
  gameId: string;
  homeScore: number;
  awayScore: number;
};

const MIN_SCORE = 0;
const MAX_SCORE = 10;

function isValidScore(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= MIN_SCORE && n <= MAX_SCORE;
}

export function parsePlaceBetBody(body: unknown): PlaceBetInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;

  const gameId = o.gameId;
  if (typeof gameId !== "string" || !gameId.trim()) return null;

  const homeScore = o.homeScore;
  const awayScore = o.awayScore;
  if (!isValidScore(homeScore) || !isValidScore(awayScore)) return null;

  return {
    gameId: gameId.trim(),
    homeScore,
    awayScore,
  };
}
