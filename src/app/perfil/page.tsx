import Link from "next/link";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/features/auth/application/actions";
import type { Rol } from "@/features/auth/domain/roles";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { Button } from "@/shared/ui/Button";
import { Logo } from "@/shared/ui/Logo";

const ETIQUETA_ROL: Record<Rol, string> = {
  cliente: "Organizo eventos",
  emprendedor: "Emprendedor de decoración",
};

// Solo lo que no está ya en la barra de navegación
const ACCESOS: Record<Rol, readonly { href: string; etiqueta: string }[]> = {
  cliente: [],
  emprendedor: [{ href: "/panel/emprendimiento", etiqueta: "Editar mi emprendimiento" }],
};

export default async function PerfilPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login?next=/perfil");

  const accesos = ACCESOS[usuario.rol];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-5 py-6">
      <Logo className="text-2xl" />

      <section className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-rosa font-display text-4xl font-black text-sandia">
          {usuario.nombre.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-3xl font-black">{usuario.nombre}</h1>
          <p className="text-sm text-gris">{ETIQUETA_ROL[usuario.rol]}</p>
        </div>
      </section>

      {accesos.length > 0 && (
        <ul className="divide-y divide-borde overflow-hidden rounded-card border border-borde bg-white">
          {accesos.map((acceso) => (
            <li key={acceso.href}>
              <Link
                href={acceso.href}
                className="flex items-center justify-between px-4 py-4 text-sm font-medium transition hover:bg-fondo"
              >
                {acceso.etiqueta}
                <span className="text-gris">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form action={cerrarSesion}>
        <Button variante="secundario">Cerrar sesión</Button>
      </form>
    </div>
  );
}
