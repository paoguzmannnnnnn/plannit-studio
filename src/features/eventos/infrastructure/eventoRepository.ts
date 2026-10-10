import type { Database } from "@/shared/supabase/database.types";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { Evento, EventoRepository } from "../domain/evento";

type Tablas = Database["public"]["Tables"];

type FilaEvento = Pick<
  Tablas["eventos"]["Row"],
  "id" | "cliente_id" | "nombre" | "tipo" | "fecha_entrega" | "direccion"
> & { zonas: Pick<Tablas["zonas"]["Row"], "id" | "nombre"> };

const SELECT_EVENTO = "id, cliente_id, nombre, tipo, fecha_entrega, direccion, zonas(id, nombre)";

function aEvento(fila: FilaEvento): Evento {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    nombre: fila.nombre,
    tipo: fila.tipo,
    fechaEntrega: fila.fecha_entrega,
    direccion: fila.direccion,
    zona: fila.zonas,
  };
}

export function crearRepositorioEventos(supabase: ClienteSupabase): EventoRepository {
  return {
    async listarDe(clienteId) {
      const { data, error } = await supabase
        .from("eventos")
        .select(SELECT_EVENTO)
        .eq("cliente_id", clienteId)
        .order("fecha_entrega");

      if (error) throw error;
      return data.map(aEvento);
    },

    async obtener(eventoId) {
      const { data, error } = await supabase
        .from("eventos")
        .select(SELECT_EVENTO)
        .eq("id", eventoId)
        .maybeSingle();

      if (error) throw error;
      return data ? aEvento(data) : null;
    },

    async crear(clienteId, datos) {
      const { data, error } = await supabase
        .from("eventos")
        .insert({
          cliente_id: clienteId,
          nombre: datos.nombre,
          tipo: datos.tipo,
          fecha_entrega: datos.fechaEntrega,
          zona_id: datos.zonaId,
          direccion: datos.direccion,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    },

    // Toda la regla de disponibilidad vive en Postgres: aquí solo se llama
    async productosDisponibles(eventoId, tipo) {
      const { data, error } = await supabase.rpc("productos_disponibles", {
        p_evento_id: eventoId,
        p_tipo: tipo,
      });

      if (error) throw error;
      return data.map((fila) => ({
        id: fila.producto_id,
        nombre: fila.nombre,
        tipo,
        precioCentavos: fila.precio_centavos,
        fotoUrl: fila.foto_url,
        disponibles: fila.disponibles,
        costoEnvioCentavos: fila.costo_envio_centavos,
        emprendimiento: {
          id: fila.emprendimiento_id,
          nombre: fila.emprendimiento_nombre,
          ratingPromedio: Number(fila.rating_promedio),
          totalResenas: fila.total_resenas,
        },
      }));
    },
  };
}
