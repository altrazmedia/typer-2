interface AdditionalBetEventForScoring {
    id: string;
    points: number;
    answer: string | null;
}

export function computeAdditionalBetPoints(
    events: AdditionalBetEventForScoring[],
    userBetsByEventId: Map<string, string>,
): number {
    let totalPoints = 0;

    for (const event of events) {
        if (event.answer === null) {
            continue;
        }

        const userAnswer = userBetsByEventId.get(event.id);
        if (userAnswer === undefined) {
            continue;
        }

        if (userAnswer.toLowerCase() === event.answer.toLowerCase()) {
            totalPoints += event.points;
        }
    }

    return totalPoints;
}
