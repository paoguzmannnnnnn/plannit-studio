import { cache } from "react";
import { createClient } from "@/shared/supabase/server";
import type { Rol } from "../domain/roles";

export type UsuarioActual = { id: string; nombre: string; rol: Rol };

export const obtenerUsuarioActual = cache(async (): Promise<UsuarioActual | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;

  const { data: perfil, error } = await supabase
    .from("profiles")
    .select("id, nombre, rol")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return perfil;
});
