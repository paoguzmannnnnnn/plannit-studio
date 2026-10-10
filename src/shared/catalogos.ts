import type { ClienteSupabase } from "@/shared/supabase/tipos";

export type Zona = { id: number; nombre: string };
export type Categoria = { id: number; nombre: string };

export async function listarZonas(supabase: ClienteSupabase): Promise<Zona[]> {
  const { data, error } = await supabase.from("zonas").select("id, nombre").order("id");
  if (error) throw error;
  return data;
}

export async function listarCategorias(supabase: ClienteSupabase): Promise<Categoria[]> {
  const { data, error } = await supabase.from("categorias").select("id, nombre").order("id");
  if (error) throw error;
  return data;
}
