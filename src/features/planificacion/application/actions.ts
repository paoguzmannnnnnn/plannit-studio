"use server";

import { revalidatePath } from "next/cache";
import { cargarEventoEditable } from "@/features/eventos/application/eventoEditable";
import { primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { MAX_MOMENTOS, momentoSchema, notasSchema } from "../domain/agenda";
import { crearRepositorioAgenda } from "../infrastructure/agendaRepository";

async function eventoEditable(eventoId: string) {
  const contexto = await cargarEventoEditable(eventoId);
  return contexto ? { evento: contexto.evento, agenda: crearRepositorioAgenda(contexto.supabase) } : null;
}

const rutaDe = (eventoId: string) => `/eventos/${eventoId}`;

export async function agregarMomento(eventoId: string, _estado: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const contexto = await eventoEditable(eventoId);
  if (!contexto) return { error: "No puedes editar este evento" };

  const momento = momentoSchema.safeParse({
    hora: texto(formData, "hora"),
    titulo: texto(formData, "titulo"),
    nota: texto(formData, "nota"),
  });
  if (!momento.success) return primerError(momento.error.issues);

  try {
    const actuales = await contexto.agenda.listar(eventoId);
    if (actuales.length >= MAX_MOMENTOS) return { error: `Puedes tener máximo ${MAX_MOMENTOS} momentos` };
    await contexto.agenda.agregar(eventoId, momento.data);
  } catch (error) {
    console.error("[planificacion:agregar]", error);
    return { error: "No pudimos guardar el momento. Intenta de nuevo." };
  }

  revalidatePath(rutaDe(eventoId));
  return { mensaje: "Agregado a tu agenda" };
}

export async function quitarMomento(eventoId: string, momentoId: string): Promise<void> {
  const contexto = await eventoEditable(eventoId);
  if (!contexto) return;

  await contexto.agenda.quitar(eventoId, momentoId);
  revalidatePath(rutaDe(eventoId));
}

export async function guardarNotas(eventoId: string, _estado: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const contexto = await eventoEditable(eventoId);
  if (!contexto) return { error: "No puedes editar este evento" };

  const notas = notasSchema.safeParse(texto(formData, "notas"));
  if (!notas.success) return primerError(notas.error.issues);

  try {
    await contexto.agenda.guardarNotas(eventoId, notas.data);
  } catch (error) {
    console.error("[planificacion:notas]", error);
    return { error: "No pudimos guardar tus notas. Intenta de nuevo." };
  }

  revalidatePath(rutaDe(eventoId));
  return { mensaje: "Notas guardadas" };
}
