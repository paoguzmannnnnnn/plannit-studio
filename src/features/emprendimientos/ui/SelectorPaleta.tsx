"use client";

import { useState } from "react";
import { ChipColor } from "@/features/colores/ui/ChipColor";
import {
  ATAJOS_PALETA,
  COLORES,
  colorDe,
  crearColorPropio,
  esColorPropio,
  MAX_COLORES_PROPIOS,
  MAX_NOMBRE_COLOR,
  normalizarPaleta,
  type IdColor,
} from "@/features/colores/domain/colores";

const claseInput =
  "h-10 min-w-0 flex-1 rounded-xl border border-borde bg-white px-3 text-base outline-none transition focus:border-sandia sm:text-sm";

function AgregarColorPropio({ onAgregar, restantes }: { onAgregar: (id: IdColor) => boolean; restantes: number }) {
  const [hex, setHex] = useState("#a8d84e");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  function agregar() {
    const id = crearColorPropio(hex, nombre);
    if (!id) return setError("Ponle nombre a tu color");
    if (!onAgregar(id)) return setError("Ese tono ya está en tu paleta");
    setNombre("");
    setError(null);
  }

  if (restantes <= 0) {
    return <p className="text-xs text-gris">Ya tienes {MAX_COLORES_PROPIOS} colores propios, el máximo.</p>;
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-borde bg-fondo p-3">
      <span className="text-xs font-medium">¿Manejas un color que no está? Agrégalo</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Tono del color"
          className="size-10 shrink-0 cursor-pointer rounded-full border border-borde bg-white p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
        />
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            // Enter agrega el color en vez de enviar todo el formulario
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
          maxLength={MAX_NOMBRE_COLOR}
          placeholder="Verde limón"
          aria-label="Nombre del color"
          className={claseInput}
        />
        <button
          type="button"
          onClick={agregar}
          className="h-10 shrink-0 rounded-full bg-tinta px-4 text-sm font-bold text-fondo transition hover:brightness-125"
        >
          Agregar
        </button>
      </div>
      {error && <p className="text-xs text-sandia">{error}</p>}
    </div>
  );
}

export function SelectorPaleta({ iniciales = [] }: { iniciales?: readonly IdColor[] }) {
  const [paleta, setPaleta] = useState<readonly IdColor[]>(() => normalizarPaleta(iniciales));
  const propios = paleta.filter(esColorPropio);

  function alternar(id: IdColor) {
    setPaleta((actual) =>
      actual.includes(id) ? actual.filter((c) => c !== id) : normalizarPaleta([...actual, id]),
    );
  }

  function agregarPropio(id: IdColor): boolean {
    const siguiente = normalizarPaleta([...paleta, id]);
    if (!siguiente.includes(id)) return false;
    setPaleta(siguiente);
    return true;
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Tu paleta de colores</legend>
      <p className="-mt-1 text-xs text-gris">
        Toca los colores que manejas. Tus clientes elegirán de aquí en los productos que dejen escoger colores.
        Si no eliges ninguno, podrán escribir el color que quieran.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gris">Rápido:</span>
        {ATAJOS_PALETA.map((atajo) => (
          <button
            key={atajo.nombre}
            type="button"
            onClick={() => setPaleta((actual) => normalizarPaleta([...actual, ...atajo.colores]))}
            className="rounded-full bg-tinta px-3 py-1 text-xs font-bold text-fondo transition hover:brightness-125"
          >
            + {atajo.nombre}
          </button>
        ))}
        {paleta.length > 0 && (
          <button type="button" onClick={() => setPaleta([])} className="text-xs text-gris underline">
            Quitar todos
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {COLORES.map((color) => (
          <ChipColor
            key={color.id}
            color={colorDe(color.id)}
            activo={paleta.includes(color.id)}
            onClick={() => alternar(color.id)}
          />
        ))}
      </div>

      {propios.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium">Tus colores propios · toca uno para quitarlo</span>
          <div className="flex flex-wrap gap-2">
            {propios.map((id) => (
              <ChipColor key={id} color={colorDe(id)} activo onClick={() => alternar(id)} quitable />
            ))}
          </div>
        </div>
      )}

      <AgregarColorPropio onAgregar={agregarPropio} restantes={MAX_COLORES_PROPIOS - propios.length} />

      <p className="text-xs text-gris">
        {paleta.length === 0 ? "Sin paleta: texto libre" : `${paleta.length} colores en tu paleta`}
      </p>

      {paleta.map((id) => (
        <input key={id} type="hidden" name="paleta" value={id} />
      ))}
    </fieldset>
  );
}
