export interface DcrBody {
    client_name: string;
    redirect_uris: string[];
    token_endpoint_auth_method?: string;
    grant_types?: string[];
    response_types?: string[];
}

export interface AuthorizeQuery {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    state?: string;
    code_challenge: string;
    code_challenge_method: string;
    scope?: string;
}

export interface TokenBody {
    grant_type: string;
    code?: string;
    redirect_uri?: string;
    client_id?: string;
    code_verifier?: string;
    refresh_token?: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: "Bearer";
    expires_in: number;
}
