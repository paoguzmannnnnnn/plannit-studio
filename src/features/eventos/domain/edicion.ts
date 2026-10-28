import type { EstadoPedido } from "@/features/pedidos/domain/estados";

// Pedidos que ya no apartan nada: no impiden mover el evento ni cuentan para el envío
const ESTADOS_QUE_LIBERAN: readonly EstadoPedido[] = ["rechazado", "expirado", "cancelado"];

export function esPedidoVivo(pedido: { estado: EstadoPedido }): boolean {
  return !ESTADOS_QUE_LIBERAN.includes(pedido.estado);
}

// Con un pedido vivo, el emprendedor ya apartó esa fecha y esa zona: no se pueden cambiar.
// La misma regla la valida un trigger en la base de datos.
export function fechaYZonaBloqueadas(pedidos: readonly { estado: EstadoPedido }[]): boolean {
  return pedidos.some(esPedidoVivo);
}
