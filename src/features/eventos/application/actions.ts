"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { horasHasta } from "@/shared/fechas";
import { mensajeDeNegocio } from "@/shared/supabase/errores";
import { createClient } from "@/shared/supabase/server";
import { fechaYZonaBloqueadas } from "../domain/edicion";
import { datosBasicosEventoSchema, fechaYZonaSchema } from "../domain/schemas";
import { crearRepositorioEventos } from "../infrastructure/eventoRepository";

function leerBasicos(formData: FormData) {
  return datosBasicosEventoSchema.safeParse({
    nombre: texto(formData, "nombre"),
    tipo: texto(formData, "tipo"),
    direccion: texto(formData, "direccion"),
  });
}

function leerFechaYZona(formData: FormData) {
  return fechaYZonaSchema.safeParse({
    fecha: texto(formData, "fecha"),
    hora: texto(formData, "hora"),
    zonaId: texto(formData, "zona"),
  });
}

export async function crearEvento(_estado: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return { error: "Inicia sesión como cliente para crear un evento" };

  const basicos = leerBasicos(formData);
  if (!basicos.success) return primerError(basicos.error.issues);
  const fechaYZona = leerFechaYZona(formData);
  if (!fechaYZona.success) return primerError(fechaYZona.error.issues);

  let eventoId: string;
  try {
    eventoId = await crearRepositorioEventos(await createClient()).crear(usuario.id, {
      ...basicos.data,
      ...fechaYZona.data,
    });
  } catch (error) {
    console.error("[eventos:crear]", error);
    return { error: "No pudimos crear tu evento. Intenta de nuevo." };
  }

  // Un evento recién creado no tiene nada: lo llevamos directo a elegir decoración
  redirect(`/eventos/${eventoId}/agregar`);
}

export async function actualizarEvento(
  eventoId: string,
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return { error: "Inicia sesión para editar tu evento" };

  const supabase = await createClient();
  const eventos = crearRepositorioEventos(supabase);
  const evento = await eventos.obtener(eventoId);
  if (!evento || evento.clienteId !== usuario.id) return { error: "No encontramos tu evento" };
  if (horasHasta(evento.fechaEntrega) <= 0) return { error: "Este evento ya pasó" };

  const basicos = leerBasicos(formData);
  if (!basicos.success) return primerError(basicos.error.issues);

  // Con pedidos vivos se conservan la fecha y la zona que ya tenía
  const pedidos = await crearRepositorioPedidos(supabase).listarDeEvento(evento.id);
  let fechaYZona = { fechaEntrega: evento.fechaEntrega, zonaId: evento.zona.id };
  if (!fechaYZonaBloqueadas(pedidos)) {
    const nuevas = leerFechaYZona(formData);
    if (!nuevas.success) return primerError(nuevas.error.issues);
    fechaYZona = nuevas.data;
  }

  try {
    await eventos.actualizar(evento.id, { ...basicos.data, ...fechaYZona });
  } catch (error) {
    console.error("[eventos:actualizar]", error);
    return { error: mensajeDeNegocio(error) ?? "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidatePath("/eventos", "layout");
  revalidatePath("/");
  redirect(`/eventos/${evento.id}`);
}
