"use client";

import { useState } from "react";
import { ETIQUETA_ESTRELLAS } from "../domain/resena";

const POSICIONES = [1, 2, 3, 4, 5] as const;

export function SelectorEstrellas() {
  const [valor, setValor] = useState(0);

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-sm font-medium">¿Cómo te fue?</legend>
      <div className="flex gap-1">
        {POSICIONES.map((posicion) => (
          <label
            key={posicion}
            className="cursor-pointer rounded-lg px-0.5 text-4xl leading-none transition hover:scale-110 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia"
          >
            <input
              type="radio"
              name="estrellas"
              value={posicion}
              onChange={() => setValor(posicion)}
              className="sr-only"
              required
            />
            <span aria-hidden className={posicion <= valor ? "text-sandia" : "text-borde"}>
              ★
            </span>
            <span className="sr-only">{posicion} de 5 estrellas</span>
          </label>
        ))}
      </div>
      <p className="text-xs text-gris" aria-live="polite">
        {ETIQUETA_ESTRELLAS[valor]}
      </p>
    </fieldset>
  );
}
