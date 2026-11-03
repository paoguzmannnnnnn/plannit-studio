import Link from "next/link";
import { formatearDolares } from "@/shared/dinero";
import type { ResumenPresupuesto } from "../domain/presupuesto";

type Props = { resumen: ResumenPresupuesto | null; hrefEditar: string | null };

// Arriba del plan: cuánto llevas contra lo que quieres gastar
export function BarraPresupuesto({ resumen, hrefEditar }: Props) {
  if (!resumen) {
    return hrefEditar ? (
      <Link
        href={hrefEditar}
        className="flex items-center justify-between gap-3 rounded-card border border-dashed border-borde bg-white px-4 py-3 text-sm transition hover:border-sandia"
      >
        <span>
          <span className="font-bold">¿Tienes un presupuesto?</span>{" "}
          <span className="text-gris">Agrégalo y te decimos cuánto te queda.</span>
        </span>
        <span className="shrink-0 font-bold text-sandia">Agregar</span>
      </Link>
    ) : null;
  }

  const { excedido } = resumen;

  return (
    <section className="flex flex-col gap-3 rounded-card border border-borde bg-white p-4" aria-label="Presupuesto">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-bold">
          {excedido
            ? `Te pasaste por ${formatearDolares(-resumen.restanteCentavos)}`
            : `Te quedan ${formatearDolares(resumen.restanteCentavos)}`}
        </p>
        <span className="shrink-0 text-xs text-gris">
          {formatearDolares(resumen.gastadoCentavos)} de {formatearDolares(resumen.presupuestoCentavos)}
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-borde"
        role="progressbar"
        aria-valuenow={resumen.porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Presupuesto usado"
      >
        <div
          className={`h-full rounded-full transition-all ${excedido ? "bg-sandia" : "bg-tinta"}`}
          style={{ width: `${resumen.porcentaje}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gris">
        <span>
          Apartado {formatearDolares(resumen.apartadoCentavos)}
          {resumen.sinApartarCentavos > 0 && ` · sin apartar ${formatearDolares(resumen.sinApartarCentavos)} + envío`}
        </span>
        {hrefEditar && (
          <Link href={hrefEditar} className="font-bold text-sandia">
            Cambiar
          </Link>
        )}
      </div>
    </section>
  );
}
