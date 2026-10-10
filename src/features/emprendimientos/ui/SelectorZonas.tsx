"use client";

import { useState } from "react";
import type { Zona } from "@/shared/catalogos";
import { aMontoEditable } from "@/shared/dinero";
import type { ZonaCobertura } from "../domain/emprendimiento";

type Props = { zonas: readonly Zona[]; iniciales?: readonly ZonaCobertura[] };

export function SelectorZonas({ zonas, iniciales = [] }: Props) {
  const costosIniciales = new Map(iniciales.map((zona) => [zona.zonaId, zona.costoEnvioCentavos]));
  const [seleccionadas, setSeleccionadas] = useState<ReadonlySet<number>>(
    () => new Set(costosIniciales.keys()),
  );

  function alternar(zonaId: number) {
    setSeleccionadas((anteriores) => {
      const siguientes = new Set(anteriores);
      if (siguientes.has(zonaId)) siguientes.delete(zonaId);
      else siguientes.add(zonaId);
      return siguientes;
    });
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">¿A qué zonas llegas?</legend>
      <p className="text-xs text-gris">
        Marca los departamentos que cubres y cuánto cobras de envío o montaje en cada uno. Si es
        gratis, déjalo en 0.
      </p>

      <ul className="divide-y divide-borde overflow-hidden rounded-card border border-borde bg-white">
        {zonas.map((zona) => {
          const activa = seleccionadas.has(zona.id);
          const costoInicial = costosIniciales.get(zona.id);
          return (
            <li key={zona.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
              <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="zona"
                  value={zona.id}
                  checked={activa}
                  onChange={() => alternar(zona.id)}
                  className="size-4 accent-sandia"
                />
                {zona.nombre}
              </label>

              {activa && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gris">$</span>
                  <input
                    name={`costo_${zona.id}`}
                    inputMode="decimal"
                    defaultValue={costoInicial === undefined ? "0" : aMontoEditable(costoInicial)}
                    aria-label={`Costo de envío a ${zona.nombre}`}
                    className="h-9 w-20 rounded-xl border border-borde px-2 text-right text-base outline-none transition focus:border-sandia sm:text-sm"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
