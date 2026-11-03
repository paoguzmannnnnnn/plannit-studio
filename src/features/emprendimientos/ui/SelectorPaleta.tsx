"use client";

import { useState } from "react";
import { ChipColor } from "@/features/colores/ui/ChipColor";
import { ATAJOS_PALETA, COLORES, type IdColor } from "@/features/colores/domain/colores";

export function SelectorPaleta({ iniciales = [] }: { iniciales?: readonly IdColor[] }) {
  const [paleta, setPaleta] = useState<ReadonlySet<IdColor>>(() => new Set(iniciales));

  function alternar(id: IdColor) {
    setPaleta((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function agregarVarios(ids: readonly IdColor[]) {
    setPaleta((actual) => new Set([...actual, ...ids]));
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Tu paleta de colores</legend>
      <p className="-mt-1 text-xs text-gris">
        Toca los colores que manejas. Tus clientes elegirán de aquí en los productos personalizables.
        Si no eliges ninguno, podrán escribir el color que quieran.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gris">Rápido:</span>
        {ATAJOS_PALETA.map((atajo) => (
          <button
            key={atajo.nombre}
            type="button"
            onClick={() => agregarVarios(atajo.colores)}
            className="rounded-full bg-tinta px-3 py-1 text-xs font-bold text-fondo transition hover:brightness-125"
          >
            + {atajo.nombre}
          </button>
        ))}
        {paleta.size > 0 && (
          <button type="button" onClick={() => setPaleta(new Set())} className="text-xs text-gris underline">
            Quitar todos
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {COLORES.map((color) => (
          <ChipColor key={color.id} color={color} activo={paleta.has(color.id)} onClick={() => alternar(color.id)} />
        ))}
      </div>

      <p className="text-xs text-gris">
        {paleta.size === 0 ? "Sin paleta: texto libre" : `${paleta.size} colores en tu paleta`}
      </p>

      {[...paleta].map((id) => (
        <input key={id} type="hidden" name="paleta" value={id} />
      ))}
    </fieldset>
  );
}
