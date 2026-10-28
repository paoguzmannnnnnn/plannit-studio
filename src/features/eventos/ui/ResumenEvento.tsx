import Link from "next/link";
import { formatearMomento, horasHasta, tiempoRestante } from "@/shared/fechas";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import type { Evento } from "../domain/evento";

const ICONO_CLASE = "size-1.5 shrink-0 rounded-full bg-sandia";

export function ResumenEvento({ evento }: { evento: Evento }) {
  const datos = [formatearMomento(evento.fechaEntrega), evento.zona.nombre, evento.direccion];
  const editable = horasHasta(evento.fechaEntrega) > 0;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gris">{evento.tipo}</span>
        <Etiqueta tono="suave">{tiempoRestante(evento.fechaEntrega)}</Etiqueta>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-black sm:text-4xl">{evento.nombre}</h1>
        {editable && (
          <Link
            href={`/eventos/${evento.id}/editar`}
            className="mt-1 shrink-0 rounded-full border border-borde bg-white px-4 py-2 text-sm font-bold transition hover:border-sandia"
          >
            Editar
          </Link>
        )}
      </div>

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
