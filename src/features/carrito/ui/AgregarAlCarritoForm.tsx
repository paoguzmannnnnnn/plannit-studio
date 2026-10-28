"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { formatearDolares } from "@/shared/dinero";
import { AreaTexto } from "@/shared/ui/AreaTexto";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { CampoReferencia } from "./CampoReferencia";

export type OpcionesPersonalizacion = {
  colores: boolean;
  texto: boolean;
  referencia: boolean;
  notas: boolean;
};

type Props = {
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
  maximo: number;
  precioCentavos: number;
  opciones: OpcionesPersonalizacion;
  hrefPlan: string;
};

const claseStepper =
  "flex size-10 items-center justify-center rounded-full border border-borde bg-white text-lg transition hover:border-sandia disabled:opacity-40";

export function AgregarAlCarritoForm({ accion, maximo, precioCentavos, opciones, hrefPlan }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const [cantidadElegida, setCantidad] = useState(1);
  // Si después de agregar quedan menos disponibles, la cantidad se ajusta sola
  const cantidad = Math.min(cantidadElegida, maximo);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
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

      {opciones.colores && (
        <Campo label="Colores" name="colores" placeholder="Rosa pastel y dorado" maxLength={80} />
      )}
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
        {pendiente ? "Agregando…" : `Agregar a mi plan · ${formatearDolares(precioCentavos * cantidad)}`}
      </Button>
    </form>
  );
}
