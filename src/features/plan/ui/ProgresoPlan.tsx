import { Etiqueta } from "@/shared/ui/Etiqueta";
import { esUrgente, listaNatural, type Plan } from "../domain/plan";
import { textoLimite } from "./textos";

export function ProgresoPlan({ plan, editable }: { plan: Plan; editable: boolean }) {
  const completo = plan.total > 0 && plan.pendientes.length === 0;

  return (
    <section className="flex flex-col gap-3 rounded-card border border-borde bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-bold">{completo ? "¡Tu plan está completo!" : `Tu plan va al ${plan.porcentaje}%`}</p>
        <span className="shrink-0 text-xs text-gris">
          {plan.elegidas} de {plan.total} listas
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-borde"
        role="progressbar"
        aria-valuenow={plan.porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Avance del plan"
      >
        <div className="h-full rounded-full bg-sandia transition-all" style={{ width: `${plan.porcentaje}%` }} />
      </div>

      {plan.pendientes.length > 0 && (
        <p className="text-xs text-gris">
          Te falta: <span className="font-bold text-tinta">{listaNatural(plan.pendientes.map((s) => s.nombre))}</span>
        </p>
      )}

      {editable && plan.proxima && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-fondo px-3 py-2 text-xs">
          <Etiqueta tono={esUrgente(plan.proxima.limite) ? "sandia" : "espera"}>Lo próximo</Etiqueta>
          <span>
            <span className="font-bold">{plan.proxima.seccion.nombre}:</span> {textoLimite(plan.proxima.limite).toLowerCase()}
          </span>
        </div>
      )}
    </section>
  );
}
