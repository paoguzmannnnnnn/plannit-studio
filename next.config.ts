import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las server actions aceptan 1 MB por defecto; las fotos de productos necesitan más
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    // Permite mostrar con next/image las imágenes guardadas en Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;