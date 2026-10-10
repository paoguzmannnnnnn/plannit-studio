import type { Rol } from "@/features/auth/domain/roles";
import type { EstadoPedido } from "@/features/pedidos/domain/estados";
import { estadoVisible, type Pedido } from "@/features/pedidos/domain/pedido";

export type Mensaje = {
  id: string;
  conversacionId: string;
  autorId: string;
  texto: string | null;
  imagenUrl: string | null;
  /** Pedido al que hace referencia el mensaje, si lo hay */
  pedidoId: string | null;
  leidoAt: string | null;
  creadoAt: string;
};

export type Conversacion = {
  id: string;
  cliente: { id: string; nombre: string };
  emprendimiento: { id: string; nombre: string; logoUrl: string | null };
  ultimo: Mensaje | null;
  noLeidos: number;
};

export type Contenido = { texto: string | null; imagenUrl: string | null; pedidoId: string | null };

export const MAX_CARACTERES_MENSAJE = 1000;

// ---------- Contexto: de qué pedido/evento se habla ----------

/** Lo mínimo de un pedido para mostrarlo en el chat */
export type PedidoEnChat = {
  id: string;
  ordenId: string;
  estado: EstadoPedido;
  evento: string;
  fechaEntrega: string;
  productos: string;
  fotoUrl: string | null;
};

export type ConversacionConContexto = Conversacion & {
  pedidos: PedidoEnChat[];
  /** El pedido que mejor resume la conversación (el próximo; si no, el último) */
  principal: PedidoEnChat | null;
};

export function aPedidoEnChat(pedido: Pedido): PedidoEnChat {
  return {
    id: pedido.id,
    ordenId: pedido.ordenId,
    estado: estadoVisible(pedido),
    evento: pedido.evento.nombre,
    fechaEntrega: pedido.fechaEntrega,
    productos: pedido.items.map((item) => item.nombre).join(" · "),
    fotoUrl: pedido.items.find((item) => item.fotoUrl)?.fotoUrl ?? null,
  };
}

// Pedidos que comparten el cliente y el emprendimiento de esta conversación
export function pedidosDe(
  conversacion: Pick<Conversacion, "cliente" | "emprendimiento">,
  pedidos: readonly Pedido[],
): PedidoEnChat[] {
  return pedidos
    .filter(
      (pedido) =>
        pedido.cliente.id === conversacion.cliente.id &&
        pedido.emprendimiento.id === conversacion.emprendimiento.id,
    )
    .map(aPedidoEnChat);
}

export function pedidoPrincipal(pedidos: readonly PedidoEnChat[], ahora: number = Date.now()): PedidoEnChat | null {
  const porFecha = [...pedidos].sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
  const proximo = porFecha.find((pedido) => new Date(pedido.fechaEntrega).getTime() >= ahora);
  return proximo ?? porFecha.at(-1) ?? null;
}

export function conContexto(conversacion: Conversacion, pedidos: readonly Pedido[]): ConversacionConContexto {
  const compartidos = pedidosDe(conversacion, pedidos);
  return { ...conversacion, pedidos: compartidos, principal: pedidoPrincipal(compartidos) };
}

// ---------- Presentación según quién mira ----------

// "La otra persona" de la conversación
export function contraparteDe(
  conversacion: Pick<Conversacion, "cliente" | "emprendimiento">,
  rol: Rol,
): { nombre: string; logoUrl: string | null } {
  return rol === "cliente"
    ? conversacion.emprendimiento
    : { nombre: conversacion.cliente.nombre, logoUrl: null };
}

const RUTA_PEDIDO: Record<Rol, (pedido: PedidoEnChat) => string> = {
  cliente: (pedido) => `/pedidos/${pedido.ordenId}`,
  emprendedor: (pedido) => `/panel/pedidos/${pedido.id}`,
};

export function rutaDelPedido(pedido: PedidoEnChat, rol: Rol): string {
  return RUTA_PEDIDO[rol](pedido);
}

export function referenciaDe(pedido: PedidoEnChat): string {
  return `${pedido.productos} · ${pedido.evento}`;
}

export function vistaPrevia(mensaje: Mensaje): string {
  return mensaje.texto ?? "Foto";
}

export function validarContenido(texto: string, tieneImagen: boolean): string | null {
  const limpio = texto.trim();
  if (!limpio && !tieneImagen) return "Escribe un mensaje o agrega una foto";
  if (limpio.length > MAX_CARACTERES_MENSAJE) {
    return `El mensaje puede tener máximo ${MAX_CARACTERES_MENSAJE} caracteres`;
  }
  return null;
}

// Búsqueda sin importar mayúsculas ni tildes
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function coincideBusqueda(conversacion: ConversacionConContexto, rol: Rol, busqueda: string): boolean {
  const buscado = normalizar(busqueda.trim());
  if (!buscado) return true;
  const textos = [
    contraparteDe(conversacion, rol).nombre,
    ...conversacion.pedidos.flatMap((pedido) => [pedido.evento, pedido.productos]),
  ];
  return textos.some((texto) => normalizar(texto).includes(buscado));
}

export interface ChatRepository {
  listarConversaciones(usuarioId: string): Promise<Conversacion[]>;
  obtenerConversacion(conversacionId: string): Promise<Conversacion | null>;
  buscarOCrear(clienteId: string, emprendimientoId: string): Promise<string>;
  listarMensajes(conversacionId: string, limite: number): Promise<Mensaje[]>;
  enviar(conversacionId: string, autorId: string, contenido: Contenido): Promise<Mensaje>;
  marcarLeidos(conversacionId: string, usuarioId: string): Promise<void>;
  contarNoLeidos(usuarioId: string): Promise<number>;
}
