interface Props {
    clientName: string;
    clientId: string;
    redirectUri: string;
    state: string | null;
    codeChallenge: string;
    codeChallengeMethod: string;
}

export const AuthorizePage: React.FC<Props> = ({
    clientName,
    clientId,
    redirectUri,
    state,
    codeChallenge,
    codeChallengeMethod,
}) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    Autoryzacja aplikacji
                </h1>
                <p className="mb-6 text-gray-600">
                    Aplikacja{" "}
                    <span className="font-semibold text-gray-900">
                        {clientName}
                    </span>{" "}
                    prosi o dostęp do Twojego konta.
                </p>

                <div className="mb-6 rounded-lg border border-gray-200 p-4">
                    <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                        Przyznane uprawnienia
                    </h2>
                    <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Odczyt informacji o Twoim profilu
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Dostęp do narzędzi MCP w Twoim imieniu
                        </li>
                    </ul>
                </div>

                <form
                    method="POST"
                    action="/api/oauth/authorize"
                    className="flex flex-col gap-3"
                >
                    <input type="hidden" name="client_id" value={clientId} />
                    <input
                        type="hidden"
                        name="redirect_uri"
                        value={redirectUri}
                    />
                    <input
                        type="hidden"
                        name="code_challenge"
                        value={codeChallenge}
                    />
                    <input
                        type="hidden"
                        name="code_challenge_method"
                        value={codeChallengeMethod}
                    />
                    {state && (
                        <input type="hidden" name="state" value={state} />
                    )}
                    <button
                        type="submit"
                        name="action"
                        value="approve"
                        className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-blue-700"
                    >
                        Zezwól
                    </button>
                    <button
                        type="submit"
                        name="action"
                        value="deny"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Odmów
                    </button>
                </form>
            </div>
        </div>
    );
};
