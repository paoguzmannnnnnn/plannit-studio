import type { Database } from "@/shared/supabase/database.types";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { Resena, ResenaRepository } from "../domain/resena";

type Tablas = Database["public"]["Tables"];

export type FilaResena = Pick<
  Tablas["resenas"]["Row"],
  "id" | "pedido_id" | "emprendimiento_id" | "estrellas" | "comentario" | "respuesta" | "created_at"
> & {
  resena_fotos: Pick<Tablas["resena_fotos"]["Row"], "url">[];
  // Sin sesión, RLS no deja ver profiles: llega null
  profiles: Pick<Tablas["profiles"]["Row"], "nombre"> | null;
};

// Se reutiliza dentro del select de pedidos
export const COLUMNAS_RESENA =
  "id, pedido_id, emprendimiento_id, estrellas, comentario, respuesta, created_at, resena_fotos(url), profiles(nombre)" as const;

const AUTOR_ANONIMO = "Cliente de Plannit";

export function aResena(fila: FilaResena): Resena {
  return {
    id: fila.id,
    pedidoId: fila.pedido_id,
    emprendimientoId: fila.emprendimiento_id,
    estrellas: fila.estrellas,
    comentario: fila.comentario,
    respuesta: fila.respuesta,
    creadaAt: fila.created_at,
    // Solo el primer nombre, por privacidad
    autor: fila.profiles?.nombre.split(" ")[0] ?? AUTOR_ANONIMO,
    fotos: fila.resena_fotos.map((foto) => foto.url),
  };
}

export function crearRepositorioResenas(supabase: ClienteSupabase): ResenaRepository {
  return {
    // El trigger de la BD valida que el pedido sea del cliente y esté completado
    async crear(pedidoId, clienteId, emprendimientoId, datos) {
      const { data, error } = await supabase
        .from("resenas")
        .insert({
          pedido_id: pedidoId,
          cliente_id: clienteId,
          emprendimiento_id: emprendimientoId,
          estrellas: datos.estrellas,
          comentario: datos.comentario,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    },

    async agregarFotos(resenaId, urls) {
      if (urls.length === 0) return;
      const { error } = await supabase
        .from("resena_fotos")
        .insert(urls.map((url) => ({ resena_id: resenaId, url })));
      if (error) throw error;
    },

    async obtener(resenaId) {
      const { data, error } = await supabase
        .from("resenas")
        .select(COLUMNAS_RESENA)
        .eq("id", resenaId)
        .maybeSingle();

      if (error) throw error;
      return data ? aResena(data) : null;
    },

    async listarDeEmprendimiento(emprendimientoId, limite) {
      const { data, error } = await supabase
        .from("resenas")
        .select(COLUMNAS_RESENA)
        .eq("emprendimiento_id", emprendimientoId)
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data.map(aResena);
    },

    // RLS: solo el dueño del emprendimiento; trigger: una sola respuesta
    async responder(resenaId, respuesta) {
      const { error } = await supabase.from("resenas").update({ respuesta }).eq("id", resenaId);
      if (error) throw error;
    },
  };
}
