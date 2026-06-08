import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    async rewrites() {
        return [
            {
                source: "/.well-known/oauth-protected-resource",
                destination: "/api/oauth/well-known/resource",
            },
            {
                source: "/.well-known/oauth-authorization-server",
                destination: "/api/oauth/well-known/auth-server",
            },
        ];
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, X-API-Key, Authorization",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
