import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DealsHub España",
    short_name: "DealsHub",
    description: "Comparador de ofertas multi-tienda en España",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    icons: [
      { src: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
