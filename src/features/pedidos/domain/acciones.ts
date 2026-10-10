import type { Rol } from "@/features/auth/domain/roles";
import type { EstadoPedido } from "./estados";
import { siguientesEstados, type Pedido, type Transicion } from "./pedido";

export type Variante = "primaria" | "secundaria" | "peligro";

/** "pago" pasa por la pasarela antes de cambiar el estado */
export type Ejecucion = "transicion" | "pago";

export type DefinicionAccion = {
  etiqueta: string;
  variante: Variante;
  ejecucion: Ejecucion;
  requiereMotivo: boolean;
};

// Cómo se presenta el botón que lleva a cada estado
const ACCION_HACIA: Partial<Record<EstadoPedido, DefinicionAccion>> = {
  aceptado: { etiqueta: "Aceptar pedido", variante: "primaria", ejecucion: "transicion", requiereMotivo: false },
  rechazado: { etiqueta: "Rechazar", variante: "peligro", ejecucion: "transicion", requiereMotivo: true },
  pagado: { etiqueta: "Pagar", variante: "primaria", ejecucion: "pago", requiereMotivo: false },
  cancelado: { etiqueta: "Cancelar pedido", variante: "peligro", ejecucion: "transicion", requiereMotivo: false },
  en_preparacion: { etiqueta: "Empezar preparación", variante: "primaria", ejecucion: "transicion", requiereMotivo: false },
  entregado: { etiqueta: "Marcar como entregado", variante: "primaria", ejecucion: "transicion", requiereMotivo: false },
  completado: { etiqueta: "Confirmar que lo recibí", variante: "primaria", ejecucion: "transicion", requiereMotivo: false },
};

export function definicionDe(estado: EstadoPedido): DefinicionAccion | undefined {
  return ACCION_HACIA[estado];
}

export type AccionVista = DefinicionAccion & { hacia: EstadoPedido };

const ORDEN_VARIANTE: Record<Variante, number> = { primaria: 0, secundaria: 1, peligro: 2 };

export function accionesPara(
  pedido: Pick<Pedido, "estado" | "expiraAt">,
  actor: Rol,
  transiciones: readonly Transicion[],
): AccionVista[] {
  return siguientesEstados(pedido, actor, transiciones)
    .flatMap((hacia) => {
      const definicion = ACCION_HACIA[hacia];
      return definicion ? [{ ...definicion, hacia }] : [];
    })
    .sort((a, b) => ORDEN_VARIANTE[a.variante] - ORDEN_VARIANTE[b.variante]);
}
