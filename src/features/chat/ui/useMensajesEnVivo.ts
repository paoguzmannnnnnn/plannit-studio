"use client";

import { useEffect } from "react";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { Mensaje } from "../domain/chat";
import { aMensaje, type FilaMensaje } from "../infrastructure/chatRepository";

// ---------------------------------------------------------------------
// OBSERVER: se suscribe a los cambios de la conversación en Supabase
// Realtime y avisa con cada mensaje nuevo o actualizado (leído).
// Los componentes no saben nada de canales ni de Postgres.
// RLS aplica también aquí: solo llegan mensajes de mis conversaciones.
// ---------------------------------------------------------------------
export function useMensajesEnVivo(
  supabase: ClienteSupabase,
  conversacionId: string,
  alRecibir: (mensaje: Mensaje) => void,
) {
  useEffect(() => {
    const filtro = {
      schema: "public",
      table: "mensajes",
      filter: `conversacion_id=eq.${conversacionId}`,
    } as const;

    const canal = supabase
      .channel(`conversacion:${conversacionId}`)
      .on("postgres_changes", { event: "INSERT", ...filtro }, (cambio) =>
        alRecibir(aMensaje(cambio.new as FilaMensaje)),
      )
      .on("postgres_changes", { event: "UPDATE", ...filtro }, (cambio) =>
        alRecibir(aMensaje(cambio.new as FilaMensaje)),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase, conversacionId, alRecibir]);
}
