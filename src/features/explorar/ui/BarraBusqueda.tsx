import { Search, X } from "lucide-react";
import Link from "next/link";
import { MAX_BUSQUEDA } from "../domain/busqueda";

// Formulario normal (GET): funciona sin JavaScript y la búsqueda queda en la URL
export function BarraBusqueda({ valor }: { valor: string }) {
  return (
    <form action="/" role="search" className="relative">
      <Search size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sandia" />
      <input
        type="search"
        name="q"
        defaultValue={valor}
        maxLength={MAX_BUSQUEDA}
        placeholder="Busca globos, mesas, backdrops…"
        aria-label="Buscar decoración"
        enterKeyHint="search"
        className="h-12 w-full rounded-full border-[1.5px] border-borde bg-white pl-11 pr-12 text-base shadow-sm outline-none transition placeholder:text-gris focus:border-sandia sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <Link
          href="/"
          aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-gris transition hover:bg-rosa hover:text-sandia"
        >
          <X size={16} />
        </Link>
      )}
    </form>
  );
}
