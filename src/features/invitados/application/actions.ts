"use server";

import { revalidatePath } from "next/cache";
import { cargarEventoEditable } from "@/features/eventos/application/eventoEditable";
import { primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { estadoInvitadoSchema, invitadoSchema, MAX_INVITADOS } from "../domain/invitados";
import { crearRepositorioInvitados } from "../infrastructure/invitadoRepository";

async function invitadosEditables(eventoId: string) {
  const contexto = await cargarEventoEditable(eventoId);
  return contexto ? crearRepositorioInvitados(contexto.supabase) : null;
}

const rutaDe = (eventoId: string) => `/eventos/${eventoId}`;

export async function agregarInvitado(eventoId: string, _estado: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const invitados = await invitadosEditables(eventoId);
  if (!invitados) return { error: "No puedes editar este evento" };

  const invitado = invitadoSchema.safeParse({
    nombre: texto(formData, "nombre"),
    personas: texto(formData, "personas") || "1",
    nota: texto(formData, "nota"),
  });
  if (!invitado.success) return primerError(invitado.error.issues);

  try {
    const actuales = await invitados.listar(eventoId);
    if (actuales.length >= MAX_INVITADOS) return { error: `Puedes tener máximo ${MAX_INVITADOS} invitados` };
    await invitados.agregar(eventoId, invitado.data);
  } catch (error) {
    console.error("[invitados:agregar]", error);
    return { error: "No pudimos agregar al invitado. Intenta de nuevo." };
  }

  revalidatePath(rutaDe(eventoId));
  return { mensaje: `${invitado.data.nombre} está en tu lista` };
}

export async function cambiarEstadoInvitado(eventoId: string, invitadoId: string, estado: string): Promise<void> {
  const nuevo = estadoInvitadoSchema.safeParse(estado);
  if (!nuevo.success) return;
  const invitados = await invitadosEditables(eventoId);
  if (!invitados) return;

  await invitados.cambiarEstado(eventoId, invitadoId, nuevo.data);
  revalidatePath(rutaDe(eventoId));
}

export async function quitarInvitado(eventoId: string, invitadoId: string): Promise<void> {
  const invitados = await invitadosEditables(eventoId);
  if (!invitados) return;

  await invitados.quitar(eventoId, invitadoId);
  revalidatePath(rutaDe(eventoId));
}
