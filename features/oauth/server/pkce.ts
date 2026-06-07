import "server-only";

/**
 * Verifies a PKCE S256 code_verifier against the stored code_challenge.
 * code_challenge = BASE64URL(SHA-256(ASCII(code_verifier)))
 */
export async function verifyPkce(
    codeVerifier: string,
    codeChallenge: string,
): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const base64url = Buffer.from(digest)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    return base64url === codeChallenge;
}
