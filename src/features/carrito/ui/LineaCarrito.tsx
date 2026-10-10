import Image from "next/image";
import { formatearDolares } from "@/shared/dinero";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { cambiarCantidad, quitarDelCarrito } from "../application/actions";
import { describirPersonalizacion, type EstadoLinea, type LineaCarrito as Linea } from "../domain/carrito";

const AVISOS: Record<Exclude<EstadoLinea, "ok">, (linea: Linea) => string> = {
  no_disponible: () => "Ya no llega a tiempo para tu fecha. Quítalo para poder confirmar.",
  excede: (linea) => `Solo quedan ${linea.disponibles} para tu fecha. Baja la cantidad.`,
};

const claseStepper =
  "flex size-8 items-center justify-center rounded-full border border-borde bg-white transition hover:border-sandia disabled:opacity-40";

export function LineaCarrito({ linea, eventoId }: { linea: Linea; eventoId: string }) {
  const detalles = describirPersonalizacion(linea.personalizacion);
  const puedeSubir = linea.estado === "ok" && linea.cantidad < linea.disponibles;

  return (
    <li className="flex gap-3 py-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-rosa">
        {linea.producto.fotoUrl && (
          <Image src={linea.producto.fotoUrl} alt={linea.producto.nombre} fill sizes="64px" className="object-cover" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-bold">{linea.producto.nombre}</p>
          <p className="shrink-0 text-sm font-bold">{formatearDolares(linea.totalCentavos)}</p>
        </div>

        {detalles.length > 0 && (
          <ul className="text-xs text-gris">
            {detalles.map((detalle) => (
              <li key={detalle} className="line-clamp-2">
                {detalle}
              </li>
            ))}
          </ul>
        )}

        {linea.estado !== "ok" && (
          <p role="alert" className="text-xs font-medium text-sandia">
            {AVISOS[linea.estado](linea)}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <form action={cambiarCantidad.bind(null, eventoId, linea.id, linea.cantidad - 1)}>
              <BotonFormulario className={claseStepper} aria-label="Quitar uno">
                −
              </BotonFormulario>
            </form>
            <span className="w-5 text-center text-sm font-bold">{linea.cantidad}</span>
            <form action={cambiarCantidad.bind(null, eventoId, linea.id, linea.cantidad + 1)}>
              <BotonFormulario className={claseStepper} disabled={!puedeSubir} aria-label="Agregar uno">
                +
              </BotonFormulario>
            </form>
          </div>
          <form action={quitarDelCarrito.bind(null, eventoId, linea.id)}>
            <BotonFormulario className="text-xs text-gris transition hover:text-sandia">Quitar</BotonFormulario>
          </form>
        </div>
      </div>
    </li>
  );
}
