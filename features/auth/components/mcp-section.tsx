import { BotIcon } from "lucide-react";

const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? "";

const monoClassName = "font-mono text-foreground";

export const McpSection: React.FC = () => {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <BotIcon className="size-5" />
                <h2 className="font-heading text-lg font-semibold">
                    Połącz z ChatGPT (MCP)
                </h2>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                    Połącz Typer z ChatGPT przez protokół MCP i obstwiaj wyniki
                    rozmawiając z AI.
                    <br />W aplikacji ChatGPT (na komputerze):
                    <ul className="mt-2 list-inside list-disc">
                        <li className="mb-1">
                            otwróz{" "}
                            <span className={monoClassName}>Ustawienia</span> →{" "}
                            <span className={monoClassName}>Aplikacje</span> →{" "}
                            <span className={monoClassName}>
                                Ustawienia zaawansowane
                            </span>
                        </li>

                        <li className="mb-1">
                            włącz{" "}
                            <span className={monoClassName}>
                                Tryb programisty
                            </span>
                        </li>
                        <li className="mb-1">
                            kliknij{" "}
                            <span className={monoClassName}>
                                Stwórz aplikację
                            </span>
                        </li>
                        <li className="mb-1">
                            w polu <span className={monoClassName}>Nazwa</span>{" "}
                            wpisz <span className={monoClassName}>Typer</span>
                        </li>
                        <li className="mb-1">
                            w polu{" "}
                            <span className={monoClassName}>Połączenie</span>{" "}
                            wpisz{" "}
                            <code className="font-mono text-foreground">
                                {MCP_URL}
                            </code>
                        </li>
                    </ul>
                </p>
            </div>
        </section>
    );
};
