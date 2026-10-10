"use server";

import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { createClient } from "@/shared/supabase/server";
import { nuevoEventoSchema } from "../domain/schemas";
import { crearRepositorioEventos } from "../infrastructure/eventoRepository";

export async function crearEvento(
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return { error: "Inicia sesión como cliente para crear un evento" };

  const resultado = nuevoEventoSchema.safeParse({
    nombre: texto(formData, "nombre"),
    tipo: texto(formData, "tipo"),
    fecha: texto(formData, "fecha"),
    hora: texto(formData, "hora"),
    zonaId: texto(formData, "zona"),
    direccion: texto(formData, "direccion"),
  });
  if (!resultado.success) return primerError(resultado.error.issues);

  let eventoId: string;
  try {
    eventoId = await crearRepositorioEventos(await createClient()).crear(usuario.id, resultado.data);
  } catch (error) {
    console.error("[eventos:crear]", error);
    return { error: "No pudimos crear tu evento. Intenta de nuevo." };
  }

  // Un evento recién creado no tiene nada: lo llevamos directo a elegir decoración
  redirect(`/eventos/${eventoId}/agregar`);
}
