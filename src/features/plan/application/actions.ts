"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esIdSeccion } from "../domain/secciones";
import { crearRepositorioPlan } from "../infrastructure/planRepository";

// "No lo necesito" / "Deshacer" sobre una sección del plan
export async function cambiarSeccion(eventoId: string, seccion: string, omitir: boolean): Promise<void> {
  if (!esIdSeccion(seccion)) return;

  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return;

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(eventoId);
  if (!evento || evento.clienteId !== usuario.id || horasHasta(evento.fechaEntrega) <= 0) return;

  const omitidas = new Set(evento.seccionesOmitidas);
  if (omitir) omitidas.add(seccion);
  else omitidas.delete(seccion);

  await crearRepositorioPlan(supabase).guardarOmitidas(evento.id, [...omitidas]);
  revalidatePath(`/eventos/${evento.id}`);
}
