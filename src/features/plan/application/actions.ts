"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esIdSeccion } from "../domain/secciones";
import { crearRepositorioPlan } from "../infrastructure/planRepository";

// "Ya lo tengo" / "Mejor lo elijo aquí" sobre un paso del plan
export async function marcarCubierta(eventoId: string, seccion: string, cubierta: boolean): Promise<void> {
  if (!esIdSeccion(seccion)) return;

  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return;

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(eventoId);
  if (!evento || evento.clienteId !== usuario.id || horasHasta(evento.fechaEntrega) <= 0) return;

  const cubiertas = new Set(evento.seccionesCubiertas);
  if (cubierta) cubiertas.add(seccion);
  else cubiertas.delete(seccion);

  await crearRepositorioPlan(supabase).guardarCubiertas(evento.id, [...cubiertas]);
  revalidatePath(`/eventos/${evento.id}`);
}
