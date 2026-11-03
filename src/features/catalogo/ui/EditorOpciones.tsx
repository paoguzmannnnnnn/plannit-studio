"use client";

import { useState } from "react";
import { aMontoEditable } from "@/shared/dinero";
import { MAX_EXTRAS, MAX_TAMANOS } from "../domain/opciones";
import type { Extra, Tamano } from "../domain/producto";

// Filas editables de tamaños o extras. Se envían juntas como JSON en un input oculto.
type Fila = { clave: string; id?: string; nombre: string; detalle: string; precio: string };

let contador = 0;
const nuevaClave = () => `nueva-${++contador}`;

const claseInput =
  "h-10 w-full min-w-0 rounded-xl border border-borde bg-white px-3 text-base outline-none transition focus:border-sandia sm:text-sm";

type Props = {
  tipo: "tamanos" | "extras";
  iniciales: readonly (Tamano | Extra)[];
  /** Avisa al formulario si hay filas (con tamaños, el precio general se oculta) */
  onCambio?: (cantidad: number) => void;
};

const TEXTOS = {
  tamanos: {
    titulo: "Tamaños",
    ayuda: "Opcional. Si los agregas, el cliente elige uno y el precio depende del tamaño.",
    boton: "+ Agregar tamaño",
    nombre: "Mediano",
    detalle: "3 m",
    maximo: MAX_TAMANOS,
  },
  extras: {
    titulo: "Extras",
    ayuda: "Opcional. Cosas que el cliente puede sumar y que no vendes por separado.",
    boton: "+ Agregar extra",
    nombre: "Base decorativa",
    detalle: "",
    maximo: MAX_EXTRAS,
  },
} as const;

export function EditorOpciones({ tipo, iniciales, onCambio }: Props) {
  const textos = TEXTOS[tipo];
  const [filas, setFilas] = useState<Fila[]>(() =>
    iniciales.map((opcion) => ({
      clave: opcion.id,
      id: opcion.id,
      nombre: opcion.nombre,
      detalle: "detalle" in opcion ? (opcion.detalle ?? "") : "",
      precio: aMontoEditable(opcion.precioCentavos),
    })),
  );

  function actualizar(siguientes: Fila[]) {
    setFilas(siguientes);
    onCambio?.(siguientes.length);
  }

  function editar(clave: string, campo: keyof Omit<Fila, "clave" | "id">, valor: string) {
    actualizar(filas.map((fila) => (fila.clave === clave ? { ...fila, [campo]: valor } : fila)));
  }

  const json = JSON.stringify(
    filas.map(({ id, nombre, detalle, precio }) =>
      tipo === "tamanos" ? { id, nombre, detalle, precio } : { id, nombre, precio },
    ),
  );

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{textos.titulo}</legend>
      <p className="-mt-1 text-xs text-gris">{textos.ayuda}</p>

      {filas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {filas.map((fila) => (
            <li key={fila.clave} className="flex items-center gap-2 rounded-2xl border border-borde bg-fondo p-2">
              <input
                value={fila.nombre}
                onChange={(e) => editar(fila.clave, "nombre", e.target.value)}
                placeholder={textos.nombre}
                aria-label="Nombre"
                className={claseInput}
              />
              {tipo === "tamanos" && (
                <input
                  value={fila.detalle}
                  onChange={(e) => editar(fila.clave, "detalle", e.target.value)}
                  placeholder={textos.detalle}
                  aria-label="Detalle"
                  className={`${claseInput} max-w-24`}
                />
              )}
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-sm text-gris">{tipo === "extras" ? "+$" : "$"}</span>
                <input
                  value={fila.precio}
                  onChange={(e) => editar(fila.clave, "precio", e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-label="Precio"
                  className={`${claseInput} w-20 text-right`}
                />
              </div>
              <button
                type="button"
                onClick={() => actualizar(filas.filter((f) => f.clave !== fila.clave))}
                aria-label="Quitar"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-lg text-gris transition hover:text-sandia"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {filas.length < textos.maximo && (
        <button
          type="button"
          onClick={() => actualizar([...filas, { clave: nuevaClave(), nombre: "", detalle: "", precio: "" }])}
          className="self-start rounded-full border border-dashed border-sandia px-4 py-2 text-sm font-bold text-sandia transition hover:bg-rosa"
        >
          {textos.boton}
        </button>
      )}

      <input type="hidden" name={tipo} value={json} />
    </fieldset>
  );
}
