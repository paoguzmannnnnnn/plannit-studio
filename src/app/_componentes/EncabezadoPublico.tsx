import Link from "next/link";
import type { UsuarioActual } from "@/features/auth/infrastructure/sesion";
import { BotonChat } from "@/features/chat/ui/BotonChat";
import { Logo } from "@/shared/ui/Logo";

// Encabezado tipo app: logo a la izquierda; con sesión, mensajes y avatar a la derecha.
// La navegación principal vive en la barra inferior.
export function EncabezadoPublico({ usuario }: { usuario: UsuarioActual | null }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Logo className="text-2xl" />
      {usuario && (
        <div className="flex items-center gap-2">
          <BotonChat />
          <Link
            href="/perfil"
            aria-label="Mi perfil"
            className="flex size-10 items-center justify-center rounded-full bg-rosa font-display text-lg font-black text-sandia transition hover:brightness-95"
          >
            {usuario.nombre.charAt(0).toUpperCase()}
          </Link>
        </div>
      )}
    </header>
  );
}
