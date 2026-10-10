import Link from "next/link";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { BotonChat } from "@/features/chat/ui/BotonChat";
import { Logo } from "@/shared/ui/Logo";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="text-2xl" />
          <span className="rounded-full bg-rosa px-2.5 py-0.5 text-[11px] font-bold text-sandia">Panel</span>
        </div>
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
      <main className="flex flex-col gap-6">{children}</main>
    </div>
  );
}
