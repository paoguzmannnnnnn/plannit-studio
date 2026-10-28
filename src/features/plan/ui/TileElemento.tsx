import Image from "next/image";
import Link from "next/link";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import type { ElementoPlan } from "../domain/plan";
import { ETIQUETA_ELEMENTO } from "./textos";

export function TileElemento({ elemento }: { elemento: ElementoPlan }) {
  const { texto, tono } = ETIQUETA_ELEMENTO[elemento.estado];

  return (
    <Link
      href={elemento.href}
      className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-white transition hover:border-sandia"
    >
      <div className="relative aspect-square bg-rosa">
        {elemento.fotoUrl && (
          <Image src={elemento.fotoUrl} alt={elemento.nombre} fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
        )}
        <Etiqueta tono={tono} className="absolute left-1.5 top-1.5">
          {texto}
        </Etiqueta>
      </div>
      <p className="truncate px-2 py-1.5 text-[11px] font-medium">
        {elemento.nombre}
        {elemento.cantidad > 1 && <span className="text-gris"> ×{elemento.cantidad}</span>}
      </p>
    </Link>
  );
}
