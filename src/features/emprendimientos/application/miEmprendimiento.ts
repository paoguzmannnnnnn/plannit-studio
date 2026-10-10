import { redirect } from "next/navigation";
import { cache } from "react";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { createClient } from "@/shared/supabase/server";
import type { Emprendimiento } from "../domain/emprendimiento";
import { crearRepositorioEmprendimientos } from "../infrastructure/emprendimientoRepository";

// El emprendimiento del usuario actual (una sola consulta por request)
export const obtenerMiEmprendimiento = cache(async (): Promise<Emprendimiento | null> => {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return null;

  const supabase = await createClient();
  return crearRepositorioEmprendimientos(supabase).obtenerPorOwner(usuario.id);
});

// Para páginas que no tienen sentido sin emprendimiento (catálogo, calendario…)
export async function requerirEmprendimiento(): Promise<Emprendimiento> {
  const emprendimiento = await obtenerMiEmprendimiento();
  if (!emprendimiento) redirect("/panel");
  return emprendimiento;
}
