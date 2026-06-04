export function formatKickoff(d: Date): string {
    return new Date(d).toLocaleString("pl-PL", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}
