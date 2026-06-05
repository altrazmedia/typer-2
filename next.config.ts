import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
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
                        value: "Content-Type, X-API-Key",
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
