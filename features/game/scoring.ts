import { BetResult } from "@prisma/client";

export interface Score {
    homeScore: number;
    awayScore: number;
}

export interface BetForScoring {
    id: string;
    homeScore: number;
    awayScore: number;
}

export interface BetResultUpdate {
    betId: string;
    betResult: BetResult;
}

function getOutcome(score: Score): -1 | 0 | 1 {
    const diff = score.homeScore - score.awayScore;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
    return 0;
}

export function classifyBet(bet: Score, actual: Score): BetResult {
    if (
        bet.homeScore === actual.homeScore &&
        bet.awayScore === actual.awayScore
    ) {
        return BetResult.EXACT_SCORE;
    }

    if (getOutcome(bet) === getOutcome(actual)) {
        return BetResult.CORRECT_OUTCOME;
    }

    return BetResult.INCORRECT;
}

export function computeBetResults(
    bets: BetForScoring[],
    actual: Score,
): BetResultUpdate[] {
    return bets.map((bet) => ({
        betId: bet.id,
        betResult: classifyBet(
            { homeScore: bet.homeScore, awayScore: bet.awayScore },
            actual,
        ),
    }));
}
