import type { ItemCarrito } from "@/features/carrito/domain/carrito";
import { crearRepositorioCarrito } from "@/features/carrito/infrastructure/carritoRepository";
import type { Evento } from "@/features/eventos/domain/evento";
import type { Pedido } from "@/features/pedidos/domain/pedido";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import { armarPlan, type Plan } from "../domain/plan";
import { crearRepositorioPlan } from "../infrastructure/planRepository";

type Entrada = {
  supabase: ClienteSupabase;
  evento: Evento;
  pedidos: readonly Pedido[];
  itemsCarrito: readonly ItemCarrito[];
  yaPaso: boolean;
};

// Junta lo necesario para armar el plan; la lógica vive en armarPlan
export async function cargarPlan({ supabase, evento, pedidos, itemsCarrito, yaPaso }: Entrada): Promise<Plan> {
  const repositorio = crearRepositorioPlan(supabase);
  const [itemsPedido, disponibilidad] = await Promise.all([
    repositorio.itemsDePedidos(pedidos.map((pedido) => pedido.id)),
    yaPaso ? Promise.resolve(new Map<string, unknown>()) : crearRepositorioCarrito(supabase).disponibilidad(evento.id),
  ]);

  const disponibles = [...disponibilidad.keys()];
  const info = await repositorio.infoProductos([
    ...itemsPedido.map((item) => item.productoId),
    ...itemsCarrito.map((item) => item.productoId),
    ...disponibles,
  ]);

  return armarPlan({
    eventoId: evento.id,
    tipoEvento: evento.tipo,
    fechaEntrega: evento.fechaEntrega,
    cubiertas: evento.seccionesCubiertas,
    pedidos,
    itemsPedido,
    itemsCarrito,
    info,
    disponibles,
  });
}
