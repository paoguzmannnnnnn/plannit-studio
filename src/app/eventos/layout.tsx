import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { EncabezadoPublico } from "../_componentes/EncabezadoPublico";

export default async function EventosLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-6">
      <EncabezadoPublico usuario={usuario} />
      <main className="flex flex-col gap-6">{children}</main>
    </div>
  );
}
