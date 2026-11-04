"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { precioConOpciones } from "@/features/catalogo/domain/opciones";
import type { Extra, Tamano } from "@/features/catalogo/domain/producto";
import type { IdColor } from "@/features/colores/domain/colores";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { formatearDolares } from "@/shared/dinero";
import { AreaTexto } from "@/shared/ui/AreaTexto";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { CampoReferencia } from "./CampoReferencia";
import { SelectorColores } from "./SelectorColores";

export type OpcionesPersonalizacion = {
  /** null: el producto no deja elegir colores. Paleta vacía: el cliente los escribe. */
  colores: { paleta: readonly IdColor[]; maximo: number } | null;
  texto: boolean;
  referencia: boolean;
  notas: boolean;
};

type Props = {
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
  maximo: number;
  precioCentavos: number;
  tamanos: readonly Tamano[];
  extras: readonly Extra[];
  opciones: OpcionesPersonalizacion;
  hrefPlan: string;
};

const claseStepper =
  "flex size-10 items-center justify-center rounded-full border border-borde bg-white text-lg transition hover:border-sandia disabled:opacity-40";

function SelectorTamano({ tamanos, elegido, onElegir }: {
  tamanos: readonly Tamano[];
  elegido: string | null;
  onElegir: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">Tamaño</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tamanos.map((tamano) => (
          <label
            key={tamano.id}
            className="flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border-[1.5px] border-borde bg-white p-3 text-center transition has-[:checked]:border-sandia has-[:checked]:bg-rosa has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia"
          >
            <input
              type="radio"
              name="tamano"
              value={tamano.id}
              checked={elegido === tamano.id}
              onChange={() => onElegir(tamano.id)}
              className="sr-only"
            />
            <span className="text-sm font-bold">{tamano.nombre}</span>
            {tamano.detalle && <span className="text-xs text-gris">{tamano.detalle}</span>}
            <span className="text-sm">{formatearDolares(tamano.precioCentavos)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectorExtras({ extras, elegidos, onAlternar }: {
  extras: readonly Extra[];
  elegidos: ReadonlySet<string>;
  onAlternar: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">Extras (opcional)</legend>
      <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-white">
        {extras.map((extra) => (
          <li key={extra.id}>
            <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="extra"
                  value={extra.id}
                  checked={elegidos.has(extra.id)}
                  onChange={() => onAlternar(extra.id)}
                  className="size-4 accent-sandia"
                />
                {extra.nombre}
              </span>
              <span className="shrink-0 text-gris">+ {formatearDolares(extra.precioCentavos)}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export function AgregarAlCarritoForm({ accion, maximo, precioCentavos, tamanos, extras, opciones, hrefPlan }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const [cantidadElegida, setCantidad] = useState(1);
  const [tamanoId, setTamanoId] = useState<string | null>(tamanos[0]?.id ?? null);
  const [extrasElegidos, setExtrasElegidos] = useState<ReadonlySet<string>>(new Set());
  // Si después de agregar quedan menos disponibles, la cantidad se ajusta sola
  const cantidad = Math.min(cantidadElegida, maximo);

  const tamano = tamanos.find((t) => t.id === tamanoId) ?? null;
  const unitario = precioConOpciones(
    precioCentavos,
    tamano,
    extras.filter((extra) => extrasElegidos.has(extra.id)),
  );

  function alternarExtra(id: string) {
    setExtrasElegidos((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {tamanos.length > 0 && <SelectorTamano tamanos={tamanos} elegido={tamanoId} onElegir={setTamanoId} />}

      {opciones.colores &&
        (opciones.colores.paleta.length > 0 ? (
          <SelectorColores paleta={opciones.colores.paleta} maximo={opciones.colores.maximo} />
        ) : (
          <Campo label="Colores" name="colores" placeholder="Rosa pastel y dorado" maxLength={80} />
        ))}

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Cantidad</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={claseStepper}
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            disabled={cantidad <= 1}
            aria-label="Quitar uno"
          >
            −
          </button>
          <span className="w-6 text-center font-bold" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            className={claseStepper}
            onClick={() => setCantidad(Math.min(maximo, cantidad + 1))}
            disabled={cantidad >= maximo}
            aria-label="Agregar uno"
          >
            +
          </button>
        </div>
      </div>
      <input type="hidden" name="cantidad" value={cantidad} />

      {extras.length > 0 && <SelectorExtras extras={extras} elegidos={extrasElegidos} onAlternar={alternarExtra} />}

      {opciones.texto && (
        <Campo label="Texto o nombre" name="texto" placeholder="Feliz cumple, Sofi" maxLength={80} />
      )}
      {opciones.referencia && <CampoReferencia />}
      {opciones.notas && (
        <AreaTexto
          label="Notas para el emprendedor"
          name="notas"
          rows={3}
          maxLength={400}
          placeholder="Medidas del espacio, temática, cualquier detalle…"
        />
      )}

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}
      {estado.mensaje && (
        <p role="status" className="flex items-center justify-between gap-3 rounded-card bg-rosa p-3 text-sm">
          <span className="font-medium">{estado.mensaje}</span>
          <Link href={hrefPlan} className="font-bold text-sandia">
            Ver mi plan ›
          </Link>
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Agregando…" : `Agregar a mi plan · ${formatearDolares(unitario * cantidad)}`}
      </Button>
    </form>
  );
}
