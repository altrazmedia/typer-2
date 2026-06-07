"use client";

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
    const handleSubmit = async (action: "approve" | "deny") => {
        const form = new FormData();
        form.append("action", action);
        form.append("client_id", clientId);
        form.append("redirect_uri", redirectUri);
        form.append("code_challenge", codeChallenge);
        form.append("code_challenge_method", codeChallengeMethod);
        if (state) form.append("state", state);

        const res = await fetch("/api/oauth/authorize", {
            method: "POST",
            body: form,
        });

        if (!res.ok) return;

        const data = (await res.json()) as { redirectUrl: string };

        window.location.href = data.redirectUrl;
    };

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

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => handleSubmit("approve")}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-blue-700"
                    >
                        Zezwól
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit("deny")}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Odmów
                    </button>
                </div>
            </div>
        </div>
    );
};
