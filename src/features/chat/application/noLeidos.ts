import { cache } from "react";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { createClient } from "@/shared/supabase/server";
import { crearRepositorioChat } from "../infrastructure/chatRepository";

// Mensajes sin leer del usuario actual (una sola consulta por request)
export const obtenerNoLeidos = cache(async (): Promise<number> => {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return 0;
  return crearRepositorioChat(await createClient()).contarNoLeidos(usuario.id);
});
