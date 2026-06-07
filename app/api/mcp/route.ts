import { handleMcpRequest } from "@/features/mcp/api/mcp";

export async function POST(req: Request) {
    return handleMcpRequest(req);
}

export async function GET(req: Request) {
    return handleMcpRequest(req);
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        },
    });
}
