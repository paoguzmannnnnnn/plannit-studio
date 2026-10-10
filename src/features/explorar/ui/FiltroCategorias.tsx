import Link from "next/link";
import type { Categoria } from "@/shared/catalogos";

type Props = { categorias: readonly Categoria[]; activa: number | null };

function Chip({ href, activo, children }: { href: string; activo: boolean; children: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={activo ? "true" : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
        activo
          ? "border-sandia bg-rosa font-bold text-sandia"
          : "border-borde bg-white hover:border-sandia"
      }`}
    >
      {children}
    </Link>
  );
}

export function FiltroCategorias({ categorias, activa }: Props) {
  return (
    <nav aria-label="Categorías" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      <Chip href="/" activo={activa === null}>
        Todo
      </Chip>
      {categorias.map((categoria) => (
        <Chip key={categoria.id} href={`/?categoria=${categoria.id}`} activo={activa === categoria.id}>
          {categoria.nombre}
        </Chip>
      ))}
    </nav>
  );
}
