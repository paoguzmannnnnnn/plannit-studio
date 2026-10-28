import type { Rol } from "@/features/auth/domain/roles";
import type { Database } from "@/shared/supabase/database.types";
import type { TonoEtiqueta } from "@/shared/ui/Etiqueta";

export type EstadoPedido = Database["public"]["Enums"]["estado_pedido"];

export type Tono = "pendiente" | "accion" | "ok" | "cerrado";

type Presentacion = {
  etiqueta: string;
  detalle: string;
  tono: Tono;
  /** Texto antes de la fecha límite, si el estado tiene plazo */
  plazo?: string;
};

// Cómo ve cada rol cada estado del pedido
export const PRESENTACION_ESTADO: Record<Rol, Record<EstadoPedido, Presentacion>> = {
  cliente: {
    solicitado: {
      etiqueta: "Esperando confirmación",
      detalle: "El emprendedor revisará tu pedido y te avisará si lo acepta.",
      tono: "pendiente",
      plazo: "Tiene hasta",
    },
    aceptado: {
      etiqueta: "Listo para pagar",
      detalle: "Paga para asegurar tu fecha.",
      tono: "accion",
      plazo: "Paga antes de",
    },
    rechazado: { etiqueta: "No aceptado", detalle: "El emprendedor no pudo tomar este pedido.", tono: "cerrado" },
    expirado: { etiqueta: "Expirado", detalle: "Se venció el tiempo para confirmar o pagar.", tono: "cerrado" },
    pagado: { etiqueta: "Pagado", detalle: "Tu fecha está asegurada.", tono: "ok" },
    en_preparacion: { etiqueta: "En preparación", detalle: "El emprendedor ya está trabajando en tu pedido.", tono: "ok" },
    entregado: { etiqueta: "Entregado", detalle: "Confirma cuando todo esté listo.", tono: "accion" },
    completado: { etiqueta: "Completado", detalle: "¡Gracias por celebrar con Plannit!", tono: "ok" },
    cancelado: { etiqueta: "Cancelado", detalle: "Cancelaste este pedido.", tono: "cerrado" },
  },
  emprendedor: {
    solicitado: {
      etiqueta: "Nuevo",
      detalle: "Revisa la personalización y acepta o rechaza el pedido.",
      tono: "accion",
      plazo: "Responde antes de",
    },
    aceptado: {
      etiqueta: "Esperando pago",
      detalle: "Lo aceptaste. Falta que el cliente pague.",
      tono: "pendiente",
      plazo: "El cliente tiene hasta",
    },
    rechazado: { etiqueta: "Rechazado", detalle: "Rechazaste este pedido.", tono: "cerrado" },
    expirado: { etiqueta: "Expirado", detalle: "Se venció el plazo para responder o pagar.", tono: "cerrado" },
    pagado: { etiqueta: "Pagado", detalle: "Ya está pagado. Empieza a prepararlo.", tono: "accion" },
    en_preparacion: { etiqueta: "En preparación", detalle: "Márcalo como entregado cuando lo lleves.", tono: "accion" },
    entregado: { etiqueta: "Entregado", detalle: "Esperando que el cliente confirme.", tono: "ok" },
    completado: { etiqueta: "Completado", detalle: "Pedido terminado.", tono: "ok" },
    cancelado: { etiqueta: "Cancelado", detalle: "El cliente canceló este pedido.", tono: "cerrado" },
  },
};

export const TONO_ETIQUETA: Record<Tono, TonoEtiqueta> = {
  pendiente: "espera",
  accion: "sandia",
  ok: "suave",
  cerrado: "neutro",
};
