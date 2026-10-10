"use client";

import { useActionState, useState } from "react";
import { ESTADO_INICIAL } from "@/shared/acciones";
import { formatearDolares } from "@/shared/dinero";
import { cambiarEstadoPedido, pagarPedido } from "../application/actions";
import type { AccionVista, Variante } from "../domain/acciones";

const CLASE_VARIANTE: Record<Variante, string> = {
  primaria: "bg-sandia text-white hover:brightness-95",
  secundaria: "border border-borde bg-white hover:border-sandia",
  peligro: "border border-borde bg-white text-sandia hover:border-sandia",
};

const claseBoton = "h-11 rounded-full px-5 text-sm font-bold transition disabled:opacity-50";

function BotonAccion({ pedidoId, accion, totalCentavos }: {
  pedidoId: string;
  accion: AccionVista;
  totalCentavos: number;
}) {
  const servidor =
    accion.ejecucion === "pago"
      ? pagarPedido.bind(null, pedidoId)
      : cambiarEstadoPedido.bind(null, pedidoId, accion.hacia);
  const [estado, ejecutar, pendiente] = useActionState(servidor, ESTADO_INICIAL);
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false);

  const etiqueta =
    accion.ejecucion === "pago" ? `${accion.etiqueta} ${formatearDolares(totalCentavos)}` : accion.etiqueta;

  if (accion.requiereMotivo && !pidiendoMotivo) {
    return (
      <button
        type="button"
        onClick={() => setPidiendoMotivo(true)}
        className={`${claseBoton} ${CLASE_VARIANTE[accion.variante]}`}
      >
        {etiqueta}
      </button>
    );
  }

  return (
    <form action={ejecutar} className={`flex flex-col gap-2 ${pidiendoMotivo ? "w-full" : ""}`}>
      {pidiendoMotivo && (
        <textarea
          name="motivo"
          rows={2}
          maxLength={300}
          required
          autoFocus
          placeholder="Ej.: Ya no tengo cupo ese día / No trabajamos ese diseño"
          aria-label="Motivo"
          className="w-full rounded-2xl border border-borde bg-white px-4 py-3 text-base outline-none transition focus:border-sandia sm:text-sm"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={pendiente} className={`${claseBoton} ${CLASE_VARIANTE[accion.variante]}`}>
          {pendiente ? "Un momento…" : pidiendoMotivo ? `Confirmar: ${etiqueta.toLowerCase()}` : etiqueta}
        </button>
        {pidiendoMotivo && (
          <button
            type="button"
            onClick={() => setPidiendoMotivo(false)}
            className={`${claseBoton} ${CLASE_VARIANTE.secundaria}`}
          >
            Volver
          </button>
        )}
      </div>
      {accion.ejecucion === "pago" && (
        <p className="text-[11px] text-gris">Pago simulado: no se cobra nada real.</p>
      )}
      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}
    </form>
  );
}

type Props = { pedidoId: string; acciones: readonly AccionVista[]; totalCentavos: number };

export function AccionesPedido({ pedidoId, acciones, totalCentavos }: Props) {
  if (acciones.length === 0) return null;

  return (
    <div className="flex flex-wrap items-start gap-2">
      {acciones.map((accion) => (
        <BotonAccion key={accion.hacia} pedidoId={pedidoId} accion={accion} totalCentavos={totalCentavos} />
      ))}
    </div>
  );
}
