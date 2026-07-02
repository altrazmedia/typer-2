export default function TournamentDetailsLoading(): React.ReactElement {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-8 w-24 shrink-0 animate-pulse rounded-md bg-muted"
                    />
                ))}
            </div>
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
    );
}
