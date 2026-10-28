import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le site est intégralement dynamique (résolu par host/slug à chaque requête),
  // donc le modèle de cache statique expérimental de Next 16 n'apporte rien ici.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
