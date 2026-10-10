"use server";

import { revalidatePath } from "next/cache";
import { obtenerMiEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { esFechaISO, hoyLocal, type FechaISO } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { crearRepositorioFechasBloqueadas } from "../infrastructure/fechasBloqueadasRepository";

export async function cambiarBloqueo(fecha: FechaISO, bloquear: boolean): Promise<void> {
  // Solo fechas válidas de hoy en adelante
  if (!esFechaISO(fecha) || fecha < hoyLocal()) return;

  const emprendimiento = await obtenerMiEmprendimiento();
  if (!emprendimiento) return;

  const repositorio = crearRepositorioFechasBloqueadas(await createClient());
  if (bloquear) await repositorio.bloquear(emprendimiento.id, fecha);
  else await repositorio.desbloquear(emprendimiento.id, fecha);

  revalidatePath("/panel/calendario");
}
