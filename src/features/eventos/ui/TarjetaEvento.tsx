import Link from "next/link";
import { formatearMomento, tiempoRestante } from "@/shared/fechas";
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
      {!pasado && (
        <span className="shrink-0 -rotate-2 rounded-full bg-rosa px-2.5 py-1 text-[11px] font-bold text-sandia">
          {tiempoRestante(evento.fechaEntrega)}
        </span>
      )}
    </Link>
  );
}
