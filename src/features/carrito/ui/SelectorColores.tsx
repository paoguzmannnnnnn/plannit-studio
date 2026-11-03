"use client";

import { useState } from "react";
import { ChipColor } from "@/features/colores/ui/ChipColor";
import { colorDe, type IdColor } from "@/features/colores/domain/colores";

type Props = { paleta: readonly IdColor[]; maximo: number };

export function SelectorColores({ paleta, maximo }: Props) {
  const [elegidos, setElegidos] = useState<IdColor[]>([]);
  const lleno = elegidos.length >= maximo;

  function alternar(id: IdColor) {
    setElegidos((actual) =>
      actual.includes(id) ? actual.filter((c) => c !== id) : lleno ? actual : [...actual, id],
    );
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">
        Colores (máx. {maximo})
      </legend>
      <p className="-mt-1 text-xs text-gris">
        {maximo === 1 ? "Elige el color" : `Elige hasta ${maximo}`} de los que maneja este emprendimiento
        {elegidos.length > 0 && ` · ${elegidos.length} de ${maximo}`}
      </p>
      <div className="flex flex-wrap gap-2">
        {paleta.map((id) => {
          const activo = elegidos.includes(id);
          return (
            <ChipColor
              key={id}
              color={colorDe(id)}
              activo={activo}
              deshabilitado={lleno && !activo}
              onClick={() => alternar(id)}
            />
          );
        })}
      </div>
      {elegidos.map((id) => (
        <input key={id} type="hidden" name="color" value={id} />
      ))}
    </fieldset>
  );
}
