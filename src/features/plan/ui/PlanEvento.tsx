import Link from "next/link";
import { formatearDolares } from "@/shared/dinero";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { cambiarSeccion } from "../application/actions";
import { esUrgente, type Plan, type SeccionDelPlan } from "../domain/plan";
import { ProgresoPlan } from "./ProgresoPlan";
import { textoLimite } from "./textos";
import { TileElemento } from "./TileElemento";

type Props = { plan: Plan; eventoId: string; editable: boolean; subtotalSinApartar: number };

function SeccionElegida({ seccion, eventoId, editable }: { seccion: SeccionDelPlan; eventoId: string; editable: boolean }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-bold">{seccion.nombre}</h3>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {seccion.elementos.map((elemento) => (
          <li key={elemento.clave}>
            <TileElemento elemento={elemento} />
          </li>
        ))}
        {editable && (
          <li>
            <Link
              href={`/eventos/${eventoId}/agregar?seccion=${seccion.id}`}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-borde text-center text-gris transition hover:border-sandia hover:text-sandia"
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-[11px]">Agregar más</span>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}

function SeccionPendiente({ seccion, eventoId }: { seccion: SeccionDelPlan; eventoId: string }) {
  const { limite } = seccion;
  const urgente = (limite.tipo === "todas" || limite.tipo === "ultima") && esUrgente(limite);

  return (
    <li className="flex flex-col gap-2 rounded-card border-[1.5px] border-dashed border-sandia/60 bg-white p-3">
      <Link href={`/eventos/${eventoId}/agregar?seccion=${seccion.id}`} className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rosa text-2xl leading-none text-sandia">
          +
        </span>
        <span className="min-w-0">
          <span className="block font-bold">{seccion.nombre}</span>
          <span className="block text-xs text-gris">{seccion.detalle}</span>
        </span>
        <span className="ml-auto shrink-0 text-sm font-bold text-sandia">Elegir ›</span>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-borde pt-2">
        <p className={`text-xs ${urgente ? "font-bold text-sandia" : "text-gris"}`}>{textoLimite(limite)}</p>
        <form action={cambiarSeccion.bind(null, eventoId, seccion.id, true)}>
          <BotonFormulario className="shrink-0 text-xs text-gris underline-offset-2 transition hover:text-tinta hover:underline">
            No lo necesito
          </BotonFormulario>
        </form>
      </div>
    </li>
  );
}

export function PlanEvento({ plan, eventoId, editable, subtotalSinApartar }: Props) {
  const elegidas = plan.secciones.filter((seccion) => !seccion.omitida && seccion.elementos.length > 0);
  const omitidas = plan.secciones.filter((seccion) => seccion.omitida);

  return (
    <div className="flex flex-col gap-6">
      <ProgresoPlan plan={plan} editable={editable} />

      {(elegidas.length > 0 || plan.extras.length > 0) && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-black">Lo que ya tienes</h2>
          {elegidas.map((seccion) => (
            <SeccionElegida key={seccion.id} seccion={seccion} eventoId={eventoId} editable={editable} />
          ))}
          {plan.extras.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">Algo más</h3>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {plan.extras.map((elemento) => (
                  <li key={elemento.clave}>
                    <TileElemento elemento={elemento} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}

      {editable && plan.pendientes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-black">Te falta</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.pendientes.map((seccion) => (
              <SeccionPendiente key={seccion.id} seccion={seccion} eventoId={eventoId} />
            ))}
          </ul>
        </section>
      )}

      {omitidas.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 text-xs text-gris">
          <span>No lo necesitas:</span>
          {omitidas.map((seccion) => (
            <form key={seccion.id} action={cambiarSeccion.bind(null, eventoId, seccion.id, false)}>
              <BotonFormulario
                disabled={!editable}
                className="rounded-full border border-borde bg-white px-3 py-1 transition hover:border-sandia"
              >
                {seccion.nombre}
                {editable && <span className="ml-1 font-bold text-sandia">· Deshacer</span>}
              </BotonFormulario>
            </form>
          ))}
        </section>
      )}

      {editable && (
        <div className="flex flex-col gap-2">
          {plan.sinApartar > 0 && (
            <Link
              href={`/eventos/${eventoId}/carrito`}
              className="flex h-12 items-center justify-center rounded-full bg-sandia px-5 text-sm font-bold text-white transition hover:brightness-95"
            >
              Apartar con los emprendedores · {formatearDolares(subtotalSinApartar)}
            </Link>
          )}
          <Link
            href={`/eventos/${eventoId}/agregar`}
            className="flex h-12 items-center justify-center rounded-full border border-borde bg-white text-sm font-bold transition hover:border-sandia"
          >
            Explorar toda la decoración
          </Link>
        </div>
      )}
    </div>
  );
}
