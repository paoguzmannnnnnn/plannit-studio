import type { Database } from "@/shared/supabase/database.types";
import { esViolacionDeUnicidad } from "@/shared/supabase/errores";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { ChatRepository, Conversacion, Mensaje } from "../domain/chat";

type Tablas = Database["public"]["Tables"];

export type FilaMensaje = Pick<
  Tablas["mensajes"]["Row"],
  "id" | "conversacion_id" | "autor_id" | "texto" | "imagen_url" | "pedido_id" | "leido_at" | "created_at"
>;

type FilaConversacion = Pick<Tablas["conversaciones"]["Row"], "id"> & {
  profiles: Pick<Tablas["profiles"]["Row"], "id" | "nombre">;
  emprendimientos: Pick<Tablas["emprendimientos"]["Row"], "id" | "nombre" | "logo_url">;
  mensajes?: FilaMensaje[];
};

const COLUMNAS_MENSAJE = "id, conversacion_id, autor_id, texto, imagen_url, pedido_id, leido_at, created_at" as const;
const COLUMNAS_CONVERSACION = "id, profiles(id, nombre), emprendimientos(id, nombre, logo_url)" as const;

// También la usa el chat en vivo para convertir lo que llega por realtime
export function aMensaje(fila: FilaMensaje): Mensaje {
  return {
    id: fila.id,
    conversacionId: fila.conversacion_id,
    autorId: fila.autor_id,
    texto: fila.texto,
    imagenUrl: fila.imagen_url,
    pedidoId: fila.pedido_id,
    leidoAt: fila.leido_at,
    creadoAt: fila.created_at,
  };
}

function aConversacion(fila: FilaConversacion, noLeidos: number): Conversacion {
  const ultimo = fila.mensajes?.[0];
  return {
    id: fila.id,
    cliente: fila.profiles,
    emprendimiento: {
      id: fila.emprendimientos.id,
      nombre: fila.emprendimientos.nombre,
      logoUrl: fila.emprendimientos.logo_url,
    },
    ultimo: ultimo ? aMensaje(ultimo) : null,
    noLeidos,
  };
}

// Funciona igual con el cliente de Supabase del servidor y del navegador
export function crearRepositorioChat(supabase: ClienteSupabase): ChatRepository {
  async function buscar(clienteId: string, emprendimientoId: string) {
    const { data, error } = await supabase
      .from("conversaciones")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("emprendimiento_id", emprendimientoId)
      .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  }

  return {
    async listarConversaciones(usuarioId) {
      const [conversaciones, sinLeer] = await Promise.all([
        supabase
          .from("conversaciones")
          .select(`${COLUMNAS_CONVERSACION}, mensajes(${COLUMNAS_MENSAJE})`)
          .order("ultimo_mensaje_at", { ascending: false, nullsFirst: false })
          .order("created_at", { referencedTable: "mensajes", ascending: false })
          .limit(1, { referencedTable: "mensajes" }),
        supabase.from("mensajes").select("conversacion_id").neq("autor_id", usuarioId).is("leido_at", null),
      ]);

      if (conversaciones.error) throw conversaciones.error;
      if (sinLeer.error) throw sinLeer.error;

      const porConversacion = new Map<string, number>();
      for (const { conversacion_id } of sinLeer.data) {
        porConversacion.set(conversacion_id, (porConversacion.get(conversacion_id) ?? 0) + 1);
      }

      return conversaciones.data
        .filter((fila) => fila.mensajes.length > 0) // las que nunca tuvieron mensajes no se listan
        .map((fila) => aConversacion(fila, porConversacion.get(fila.id) ?? 0));
    },

    async obtenerConversacion(conversacionId) {
      const { data, error } = await supabase
        .from("conversaciones")
        .select(COLUMNAS_CONVERSACION)
        .eq("id", conversacionId)
        .maybeSingle();
      if (error) throw error;
      return data ? aConversacion(data, 0) : null;
    },

    // Una conversación por pareja cliente–emprendimiento
    async buscarOCrear(clienteId, emprendimientoId) {
      const existente = await buscar(clienteId, emprendimientoId);
      if (existente) return existente;

      const { data, error } = await supabase
        .from("conversaciones")
        .insert({ cliente_id: clienteId, emprendimiento_id: emprendimientoId })
        .select("id")
        .single();

      if (!error) return data.id;
      // Si alguien la creó en el mismo instante, usamos esa
      if (esViolacionDeUnicidad(error)) {
        const creada = await buscar(clienteId, emprendimientoId);
        if (creada) return creada;
      }
      throw error;
    },

    async listarMensajes(conversacionId, limite) {
      const { data, error } = await supabase
        .from("mensajes")
        .select(COLUMNAS_MENSAJE)
        .eq("conversacion_id", conversacionId)
        .order("created_at", { ascending: false })
        .limit(limite);
      if (error) throw error;
      return data.map(aMensaje).reverse();
    },

    async enviar(conversacionId, autorId, contenido) {
      const { data, error } = await supabase
        .from("mensajes")
        .insert({
          conversacion_id: conversacionId,
          autor_id: autorId,
          texto: contenido.texto,
          imagen_url: contenido.imagenUrl,
          pedido_id: contenido.pedidoId,
        })
        .select(COLUMNAS_MENSAJE)
        .single();
      if (error) throw error;
      return aMensaje(data);
    },

    // RLS solo deja marcar como leídos los mensajes que recibí
    async marcarLeidos(conversacionId, usuarioId) {
      const { error } = await supabase
        .from("mensajes")
        .update({ leido_at: new Date().toISOString() })
        .eq("conversacion_id", conversacionId)
        .neq("autor_id", usuarioId)
        .is("leido_at", null);
      if (error) throw error;
    },

    async contarNoLeidos(usuarioId) {
      const { count, error } = await supabase
        .from("mensajes")
        .select("id", { count: "exact", head: true })
        .neq("autor_id", usuarioId)
        .is("leido_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  };
}
