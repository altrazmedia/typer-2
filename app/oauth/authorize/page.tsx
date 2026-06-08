import { redirect } from "next/navigation";

import { AuthorizePage } from "@/features/oauth/components/authorize-page";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface SearchParams {
    client_id?: string;
    redirect_uri?: string;
    response_type?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
}

interface Props {
    searchParams: Promise<SearchParams>;
}

export default async function OAuthAuthorizePage({ searchParams }: Props) {
    const params = await searchParams;
    const {
        client_id,
        redirect_uri,
        response_type,
        state,
        code_challenge,
        code_challenge_method,
    } = params;

    if (
        !client_id ||
        !redirect_uri ||
        response_type !== "code" ||
        !code_challenge ||
        !code_challenge_method
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-600">
                    Nieprawidłowe parametry autoryzacji.
                </p>
            </div>
        );
    }

    const session = await auth();
    if (!session?.user?.id) {
        const callbackUrl = `/oauth/authorize?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&state=${encodeURIComponent(state ?? "")}&code_challenge=${encodeURIComponent(code_challenge)}&code_challenge_method=${encodeURIComponent(code_challenge_method)}`;
        redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    const client = await prisma.oAuthClient.findUnique({
        where: { id: client_id },
    });
    if (!client || !client.redirectUris.includes(redirect_uri)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-600">
                    Nieznany klient OAuth lub nieprawidłowy redirect_uri.
                </p>
            </div>
        );
    }

    return (
        <AuthorizePage
            clientName={client.clientName}
            clientId={client_id}
            redirectUri={redirect_uri}
            state={state ?? null}
            codeChallenge={code_challenge}
            codeChallengeMethod={code_challenge_method}
        />
    );
}
