import Link from "next/link";
import { formatearMomento, tiempoRestante } from "@/shared/fechas";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import type { Evento } from "../domain/evento";

export function TarjetaEvento({ evento, pasado = false }: { evento: Evento; pasado?: boolean }) {
  return (
    <Link
      href={`/eventos/${evento.id}`}
      className={`flex items-center justify-between gap-4 rounded-card border border-borde bg-white p-4 transition hover:border-sandia ${pasado ? "opacity-60" : ""}`}
    >
      <div className="min-w-0">
        <p className="truncate font-bold">{evento.nombre}</p>
        <p className="truncate text-xs text-gris">
          {evento.tipo} · {formatearMomento(evento.fechaEntrega)} · {evento.zona.nombre}
        </p>
      </div>
      {!pasado && <Etiqueta tono="suave">{tiempoRestante(evento.fechaEntrega)}</Etiqueta>}
    </Link>
  );
}
