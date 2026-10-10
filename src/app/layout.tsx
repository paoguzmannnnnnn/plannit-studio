import type { Metadata, Viewport } from "next";
import { DM_Sans, Grandstander } from "next/font/google";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { obtenerPendientes } from "@/features/pedidos/application/pendientes";
import { BarraNavegacion } from "./_componentes/BarraNavegacion";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

// Fuente variable: un solo archivo trae todos los pesos (usamos 800–900)
const grandstander = Grandstander({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-grandstander",
});

export const metadata: Metadata = {
  title: "Plannit Studio",
  description: "Organiza la decoración de tu evento desde un solo lugar.",
  applicationName: "Plannit Studio",
  // iPhone: abrir a pantalla completa desde el ícono de inicio
  appleWebApp: {
    capable: true,
    title: "Plannit",
    statusBarStyle: "default",
  },
};

// El ancho del celular manda (sin esto el iPhone dibuja la página a 980px y la encoge).
// viewportFit "cover" permite respetar la zona segura (barra de gestos).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FCFAF7",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [usuario, pendientes] = await Promise.all([obtenerUsuarioActual(), obtenerPendientes()]);

  return (
    <html lang="es" className={`${dmSans.variable} ${grandstander.variable}`}>
      <body className="font-sans antialiased">
        {/* Espacio abajo para que la barra flotante no tape el contenido */}
        <div className="pb-[calc(7rem+env(safe-area-inset-bottom))]">{children}</div>
        <BarraNavegacion audiencia={usuario?.rol ?? "invitado"} pendientes={pendientes.length} />
      </body>
    </html>
  );
}
