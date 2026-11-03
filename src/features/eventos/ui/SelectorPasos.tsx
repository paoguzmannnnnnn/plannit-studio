"use client";

import { Check } from "lucide-react";
import { IDS_SECCIONES, SECCIONES, type IdSeccion } from "@/features/plan/domain/secciones";

type Props = {
  elegidos: ReadonlySet<IdSeccion>;
  onCambio: (elegidos: Set<IdSeccion>) => void;
  /** Texto bajo el título: depende de si ya hay sugerencia */
  ayuda: string;
};

// Qué va a incluir el plan. Cada paso elegido aparece en "Tu plan, paso a paso".
export function SelectorPasos({ elegidos, onCambio, ayuda }: Props) {
  function alternar(id: IdSeccion) {
    const siguiente = new Set(elegidos);
    if (siguiente.has(id)) siguiente.delete(id);
    else siguiente.add(id);
    onCambio(siguiente);
  }

  return (
    <fieldset id="pasos" className="flex scroll-mt-24 flex-col gap-2">
      <legend className="text-sm font-medium">¿Qué vas a necesitar?</legend>
      <p className="-mt-1 text-xs text-gris">{ayuda}</p>
      <div className="grid grid-cols-2 gap-2">
        {IDS_SECCIONES.map((id) => {
          const activo = elegidos.has(id);
          return (
            <label
              key={id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia ${
                activo ? "border-sandia bg-rosa" : "border-borde bg-white hover:border-sandia"
              }`}
            >
              <input
                type="checkbox"
                name="paso"
                value={id}
                checked={activo}
                onChange={() => alternar(id)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                  activo ? "bg-sandia text-white" : "border-[1.5px] border-borde bg-white"
                }`}
              >
                {activo && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{SECCIONES[id].nombre}</span>
                <span className="block text-xs text-gris">{SECCIONES[id].detalle}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
