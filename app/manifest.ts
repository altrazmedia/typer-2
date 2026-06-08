import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Typer",
        short_name: "Typer",
        description: "Prywatne typowanie wyników meczów",
        start_url: "/",
        display: "standalone",
        theme_color: "#6c47ff",
        background_color: "#f5f5fb",
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
