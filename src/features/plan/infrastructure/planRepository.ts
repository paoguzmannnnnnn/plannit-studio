import { urlsOrdenadas } from "@/features/catalogo/infrastructure/mapeos";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { InfoProducto, ItemDePedido } from "../domain/plan";

type ProductoDeItem = { nombre: string; producto_fotos: { url: string; orden: number }[] } | null;
type CategoriaDeProducto = { nombre: string } | null;

export interface PlanRepository {
  itemsDePedidos(pedidoIds: readonly string[]): Promise<ItemDePedido[]>;
  infoProductos(productoIds: readonly string[]): Promise<Map<string, InfoProducto>>;
  guardarCubiertas(eventoId: string, secciones: readonly string[]): Promise<void>;
}

export function crearRepositorioPlan(supabase: ClienteSupabase): PlanRepository {
  return {
    async itemsDePedidos(pedidoIds) {
      if (pedidoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("pedido_items")
        .select("pedido_id, producto_id, cantidad, productos(nombre, producto_fotos(url, orden))")
        .in("pedido_id", [...pedidoIds]);

      if (error) throw error;
      return data.map((fila) => {
        // Si el emprendedor pausó el producto, RLS ya no lo deja ver: llega null
        const producto = fila.productos as ProductoDeItem;
        return {
          pedidoId: fila.pedido_id,
          productoId: fila.producto_id,
          nombre: producto?.nombre ?? "Producto",
          fotoUrl: producto ? (urlsOrdenadas(producto.producto_fotos)[0] ?? null) : null,
          cantidad: fila.cantidad,
        };
      });
    },

    async infoProductos(productoIds) {
      const ids = [...new Set(productoIds)];
      if (ids.length === 0) return new Map();

      const { data, error } = await supabase
        .from("productos")
        .select("id, anticipacion_horas, categorias(nombre)")
        .in("id", ids);

      if (error) throw error;
      return new Map(
        data.flatMap((fila) => {
          const categoria = fila.categorias as CategoriaDeProducto;
          return categoria
            ? [[fila.id, { categoria: categoria.nombre, anticipacionHoras: fila.anticipacion_horas }] as const]
            : [];
        }),
      );
    },

    async guardarCubiertas(eventoId, secciones) {
      const { error } = await supabase
        .from("eventos")
        .update({ secciones_omitidas: [...secciones] })
        .eq("id", eventoId);
      if (error) throw error;
    },
  };
}
