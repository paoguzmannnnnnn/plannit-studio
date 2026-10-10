import { urlsOrdenadas } from "@/features/catalogo/infrastructure/mapeos";
import type { Database } from "@/shared/supabase/database.types";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import {
  personalizacionSchema,
  type CarritoRepository,
  type Disponibilidad,
  type ItemCarrito,
} from "../domain/carrito";

type Tablas = Database["public"]["Tables"];

type FilaItem = Pick<Tablas["carrito_items"]["Row"], "id" | "producto_id" | "cantidad" | "personalizacion"> & {
  // Puede venir null si el producto se pausó (RLS ya no lo deja ver)
  productos:
    | (Pick<Tablas["productos"]["Row"], "nombre" | "tipo" | "precio_centavos"> & {
        producto_fotos: Pick<Tablas["producto_fotos"]["Row"], "url" | "orden">[];
        emprendimientos: Pick<Tablas["emprendimientos"]["Row"], "id" | "nombre"> | null;
      })
    | null;
};

const SELECT_ITEM =
  "id, producto_id, cantidad, personalizacion, productos(nombre, tipo, precio_centavos, producto_fotos(url, orden), emprendimientos(id, nombre))";

function aItem(fila: FilaItem): ItemCarrito {
  const producto = fila.productos;
  return {
    id: fila.id,
    productoId: fila.producto_id,
    cantidad: fila.cantidad,
    personalizacion: personalizacionSchema.safeParse(fila.personalizacion).data ?? {},
    producto:
      producto && producto.emprendimientos
        ? {
            nombre: producto.nombre,
            tipo: producto.tipo,
            precioCentavos: producto.precio_centavos,
            fotoUrl: urlsOrdenadas(producto.producto_fotos)[0] ?? null,
            emprendimiento: producto.emprendimientos,
          }
        : null,
  };
}

export function crearRepositorioCarrito(supabase: ClienteSupabase): CarritoRepository {
  return {
    async listarItems(eventoId) {
      const { data, error } = await supabase
        .from("carrito_items")
        .select(SELECT_ITEM)
        .eq("evento_id", eventoId)
        .order("created_at");

      if (error) throw error;
      return data.map(aItem);
    },

    // La regla vive en Postgres (misma que usan las pestañas del evento)
    async disponibilidad(eventoId) {
      const { data, error } = await supabase.rpc("disponibilidad_evento", { p_evento_id: eventoId });
      if (error) throw error;

      return new Map<string, Disponibilidad>(
        data.map((fila) => [
          fila.producto_id,
          { disponibles: fila.disponibles, costoEnvioCentavos: fila.costo_envio_centavos },
        ]),
      );
    },

    async agregar(eventoId, productoId, cantidad, personalizacion) {
      const { error } = await supabase
        .from("carrito_items")
        .insert({ evento_id: eventoId, producto_id: productoId, cantidad, personalizacion });
      if (error) throw error;
    },

    async cambiarCantidad(eventoId, itemId, cantidad) {
      const { error } = await supabase
        .from("carrito_items")
        .update({ cantidad })
        .eq("id", itemId)
        .eq("evento_id", eventoId);
      if (error) throw error;
    },

    async quitar(eventoId, itemId) {
      const { error } = await supabase
        .from("carrito_items")
        .delete()
        .eq("id", itemId)
        .eq("evento_id", eventoId);
      if (error) throw error;
    },

    // Checkout atómico en Postgres: revalida, bloquea cupos y crea un pedido por emprendimiento
    async confirmar(eventoId) {
      const { data, error } = await supabase.rpc("crear_orden", { p_evento_id: eventoId });
      if (error) throw error;
      return data;
    },
  };
}
