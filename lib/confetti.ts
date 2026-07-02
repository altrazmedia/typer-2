export function fireConfetti(): void {
    void import("canvas-confetti").then((confetti) => {
        confetti.default({
            particleCount: 400,
            spread: 100,
            origin: { y: 0.6 },
        });
    });
}
