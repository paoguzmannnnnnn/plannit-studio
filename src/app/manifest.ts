import type { MetadataRoute } from "next";

// Lo que hace que el celular trate la web como app al "Agregar a pantalla de inicio"
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plannit Studio",
    short_name: "Plannit",
    description: "Organiza la decoración de tu evento desde un solo lugar.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone", // sin barra del navegador
    orientation: "portrait",
    background_color: "#FCFAF7",
    theme_color: "#FCFAF7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
