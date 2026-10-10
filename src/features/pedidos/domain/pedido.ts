import type { Rol } from "@/features/auth/domain/roles";
import type { Personalizacion } from "@/features/carrito/domain/carrito";
import type { Resena } from "@/features/resenas/domain/resena";
import type { EstadoPedido } from "./estados";

export type ItemPedido = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  cantidad: number;
  precioUnitarioCentavos: number;
  personalizacion: Personalizacion;
};

export type Pedido = {
  id: string;
  ordenId: string;
  estado: EstadoPedido;
  subtotalCentavos: number;
  costoEnvioCentavos: number;
  expiraAt: string | null;
  motivoRechazo: string | null;
  fechaEntrega: string;
  emprendimiento: { id: string; nombre: string };
  cliente: { id: string; nombre: string };
  evento: { id: string; nombre: string; direccion: string; zona: string };
  items: ItemPedido[];
  resena: Resena | null;
};

// El cliente puede reseñar cuando el pedido está completado y aún no lo hizo
export function puedeResenarse(pedido: Pick<Pedido, "estado" | "resena">): boolean {
  return pedido.estado === "completado" && pedido.resena === null;
}

// "La otra parte" del pedido: el cliente ve al emprendimiento y el emprendedor ve al cliente
export function contraparte(pedido: Pick<Pedido, "emprendimiento" | "cliente">, rol: Rol): string {
  return rol === "cliente" ? pedido.emprendimiento.nombre : pedido.cliente.nombre;
}

export function totalDe(pedido: Pick<Pedido, "subtotalCentavos" | "costoEnvioCentavos">): number {
  return pedido.subtotalCentavos + pedido.costoEnvioCentavos;
}

// ---------------------------------------------------------------------
// MÁQUINA DE ESTADOS: las transiciones vienen de la tabla
// transiciones_pedido (la misma que valida Postgres). La app no repite
// las reglas: solo pregunta "¿qué puede hacer este rol en este estado?".
// ---------------------------------------------------------------------
export type Transicion = { desde: EstadoPedido; hacia: EstadoPedido; actor: Rol };

const ESTADOS_CON_PLAZO: readonly EstadoPedido[] = ["solicitado", "aceptado"];

// El cron marca los expirados cada 15 min; mientras tanto, la app ya los trata como vencidos
export function estaVencido(pedido: Pick<Pedido, "estado" | "expiraAt">, ahora: number = Date.now()): boolean {
  return (
    ESTADOS_CON_PLAZO.includes(pedido.estado) &&
    pedido.expiraAt !== null &&
    new Date(pedido.expiraAt).getTime() < ahora
  );
}

export function estadoVisible(pedido: Pick<Pedido, "estado" | "expiraAt">): EstadoPedido {
  return estaVencido(pedido) ? "expirado" : pedido.estado;
}

export function siguientesEstados(
  pedido: Pick<Pedido, "estado" | "expiraAt">,
  actor: Rol,
  transiciones: readonly Transicion[],
): EstadoPedido[] {
  if (estaVencido(pedido)) return [];
  return transiciones
    .filter((transicion) => transicion.desde === pedido.estado && transicion.actor === actor)
    .map((transicion) => transicion.hacia);
}

export type Etapa = "por_atender" | "en_espera" | "historial";

// Por atender = este rol tiene algo que hacer; en espera = le toca al otro; historial = ya no se mueve
export function etapaDe(pedido: Pedido, actor: Rol, transiciones: readonly Transicion[]): Etapa {
  if (siguientesEstados(pedido, actor, transiciones).length > 0) return "por_atender";
  const sigueAbierto =
    !estaVencido(pedido) && transiciones.some((transicion) => transicion.desde === pedido.estado);
  return sigueAbierto ? "en_espera" : "historial";
}

export function agruparPorEtapa(
  pedidos: readonly Pedido[],
  actor: Rol,
  transiciones: readonly Transicion[],
): Record<Etapa, Pedido[]> {
  const grupos: Record<Etapa, Pedido[]> = { por_atender: [], en_espera: [], historial: [] };
  for (const pedido of pedidos) grupos[etapaDe(pedido, actor, transiciones)].push(pedido);
  grupos.historial.reverse(); // lo más reciente primero
  return grupos;
}

export interface PedidoRepository {
  listarDeCliente(clienteId: string): Promise<Pedido[]>;
  listarDeEmprendimiento(emprendimientoId: string): Promise<Pedido[]>;
  listarDeEvento(eventoId: string): Promise<Pedido[]>;
  listarDeOrden(ordenId: string): Promise<Pedido[]>;
  obtener(pedidoId: string): Promise<Pedido | null>;
  transiciones(): Promise<Transicion[]>;
  cambiarEstado(pedidoId: string, estado: EstadoPedido, motivo?: string): Promise<void>;
}
