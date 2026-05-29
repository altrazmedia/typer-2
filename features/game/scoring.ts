interface Score {
    homeScore: number;
    awayScore: number;
}

interface ScoringRule {
    exactScorePoints: number;
    correctOutcomePoints: number;
}

function getOutcome(score: Score): -1 | 0 | 1 {
    const diff = score.homeScore - score.awayScore;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
    return 0;
}

export function calculatePoints(
    bet: Score,
    actual: Score,
    rule: ScoringRule,
): number {
    if (
        bet.homeScore === actual.homeScore &&
        bet.awayScore === actual.awayScore
    ) {
        return rule.exactScorePoints;
    }

    if (getOutcome(bet) === getOutcome(actual)) {
        return rule.correctOutcomePoints;
    }

    return 0;
}
