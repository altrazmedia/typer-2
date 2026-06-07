import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { verifyToken } from "@/features/oauth/server/jwt";
import { prisma } from "@/lib/db";

const RESOURCE_METADATA_URL = "/.well-known/oauth-protected-resource";

function unauthorizedResponse(): Response {
    return new Response(
        JSON.stringify({ error: "Wymagane uwierzytelnienie." }),
        {
            status: 401,
            headers: {
                "Content-Type": "application/json",
                "WWW-Authenticate": `Bearer resource_metadata="${RESOURCE_METADATA_URL}"`,
            },
        },
    );
}

export async function handleMcpRequest(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204 });
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
        return unauthorizedResponse();
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return unauthorizedResponse();
    }

    const userId = payload.sub;

    const server = new McpServer({
        name: "typer-2",
        version: "1.0.0",
    });

    server.tool(
        "whoami",
        "Zwraca informacje o aktualnie uwierzytelnionym użytkowniku.",
        {},
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true },
            });
            if (!user) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: "Użytkownik nie został znaleziony.",
                        },
                    ],
                    isError: true,
                };
            }
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                        }),
                    },
                ],
            };
        },
    );

    const transport = new WebStandardStreamableHTTPServerTransport({
        enableJsonResponse: true,
    });

    await server.connect(transport);
    return transport.handleRequest(request);
}
