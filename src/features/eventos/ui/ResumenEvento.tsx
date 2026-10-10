import { formatearMomento, tiempoRestante } from "@/shared/fechas";
import type { Evento } from "../domain/evento";

const ICONO_CLASE = "size-1.5 shrink-0 rounded-full bg-sandia";

export function ResumenEvento({ evento }: { evento: Evento }) {
  const datos = [
    formatearMomento(evento.fechaEntrega),
    evento.zona.nombre,
    evento.direccion,
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gris">{evento.tipo}</span>
        <span className="-rotate-2 rounded-full bg-rosa px-2.5 py-1 text-[11px] font-bold text-sandia">
          {tiempoRestante(evento.fechaEntrega)}
        </span>
      </div>
      <h1 className="font-display text-3xl font-black sm:text-4xl">{evento.nombre}</h1>
      <ul className="flex flex-wrap gap-2">
        {datos.map((dato) => (
          <li
            key={dato}
            className="flex items-center gap-2 rounded-full border border-borde bg-white px-3 py-1.5 text-xs"
          >
            <span className={ICONO_CLASE} aria-hidden />
            {dato}
          </li>
        ))}
      </ul>
    </section>
  );
}
