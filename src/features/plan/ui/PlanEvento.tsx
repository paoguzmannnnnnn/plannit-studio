import { Check } from "lucide-react";
import Link from "next/link";
import { formatearDolares } from "@/shared/dinero";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import { marcarCubierta } from "../application/actions";
import { esUrgente, type ElementoPlan, type Plan, type SeccionDelPlan } from "../domain/plan";
import { ProgresoPlan } from "./ProgresoPlan";
import { textoLimite } from "./textos";
import { TileElemento } from "./TileElemento";

type Props = { plan: Plan; eventoId: string; editable: boolean; subtotalSinApartar: number };

function Galeria({ elementos, hrefAgregar }: { elementos: readonly ElementoPlan[]; hrefAgregar: string | null }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {elementos.map((elemento) => (
        <li key={elemento.clave}>
          <TileElemento elemento={elemento} />
        </li>
      ))}
      {hrefAgregar && (
        <li>
          <Link
            href={hrefAgregar}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-borde text-center text-gris transition hover:border-sandia hover:text-sandia"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-[11px]">{elementos.length > 0 ? "Agregar más" : "Agregar"}</span>
          </Link>
        </li>
      )}
    </ul>
  );
}

function Numero({ paso, listo }: { paso: number; listo: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        listo ? "bg-sandia text-white" : "border-[1.5px] border-sandia bg-white text-sandia"
      }`}
      aria-hidden
    >
      {listo ? <Check size={16} strokeWidth={3} /> : paso}
    </span>
  );
}

function Paso({ seccion, paso, eventoId, editable }: { seccion: SeccionDelPlan; paso: number; eventoId: string; editable: boolean }) {
  const elegido = seccion.elementos.length > 0;
  const listo = elegido || seccion.cubierta;
  const hrefElegir = `/eventos/${eventoId}/agregar?seccion=${seccion.id}`;
  const { limite } = seccion;
  const urgente = (limite.tipo === "todas" || limite.tipo === "ultima") && esUrgente(limite);

  return (
    <li className={`flex flex-col gap-3 rounded-card border bg-white p-4 ${listo ? "border-borde" : "border-[1.5px] border-dashed border-sandia/60"}`}>
      <div className="flex items-center gap-3">
        <Numero paso={paso} listo={listo} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{seccion.nombre}</p>
          <p className="text-xs text-gris">{seccion.detalle}</p>
        </div>
        {!listo && editable && (
          <Link
            href={hrefElegir}
            className="shrink-0 rounded-full bg-sandia px-4 py-2 text-sm font-bold text-white transition hover:brightness-95"
          >
            Elegir
          </Link>
        )}
      </div>

      {elegido && <Galeria elementos={seccion.elementos} hrefAgregar={editable ? hrefElegir : null} />}

      {!elegido && seccion.cubierta && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-fondo px-3 py-2 text-xs">
          <span className="font-medium">Ya lo tienes cubierto</span>
          {editable && (
            <form action={marcarCubierta.bind(null, eventoId, seccion.id, false)}>
              <BotonFormulario className="font-bold text-sandia">Mejor lo elijo aquí</BotonFormulario>
            </form>
          )}
        </div>
      )}

      {!listo && editable && (
        <div className="flex items-center justify-between gap-3 border-t border-borde pt-2">
          <p className={`text-xs ${urgente ? "font-bold text-sandia" : "text-gris"}`}>{textoLimite(limite)}</p>
          <form action={marcarCubierta.bind(null, eventoId, seccion.id, true)}>
            <BotonFormulario className="shrink-0 rounded-full border border-borde px-3 py-1 text-xs transition hover:border-sandia">
              Ya lo tengo
            </BotonFormulario>
          </form>
        </div>
      )}
    </li>
  );
}

export function PlanEvento({ plan, eventoId, editable, subtotalSinApartar }: Props) {
  const mostrarExtras = editable || plan.extras.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <ProgresoPlan plan={plan} editable={editable} />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-black">Tu plan, paso a paso</h2>
        <ol className="flex flex-col gap-3">
          {plan.secciones.map((seccion, indice) => (
            <Paso key={seccion.id} seccion={seccion} paso={indice + 1} eventoId={eventoId} editable={editable} />
          ))}

          {mostrarExtras && (
            <li className="flex flex-col gap-3 rounded-card border border-borde bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-gris text-sm text-gris" aria-hidden>
                  +
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Extras</p>
                  <p className="text-xs text-gris">Lo que quieras sumar a tu evento</p>
                </div>
                <Etiqueta tono="punteado">Opcional</Etiqueta>
              </div>
              <Galeria elementos={plan.extras} hrefAgregar={editable ? `/eventos/${eventoId}/agregar` : null} />
            </li>
          )}
        </ol>
      </section>

      {editable && plan.sinApartar > 0 && (
        <Link
          href={`/eventos/${eventoId}/carrito`}
          className="flex h-12 items-center justify-center rounded-full bg-sandia px-5 text-sm font-bold text-white transition hover:brightness-95"
        >
          Apartar con los emprendedores · {formatearDolares(subtotalSinApartar)}
        </Link>
      )}
    </div>
  );
}
