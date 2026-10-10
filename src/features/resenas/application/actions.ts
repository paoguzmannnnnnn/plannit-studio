"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { obtenerMiEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { archivos, primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { validarImagen } from "@/shared/storage/reglasImagenes";
import { subirImagen } from "@/shared/storage/subirImagen";
import { mensajeDeNegocio } from "@/shared/supabase/errores";
import { createClient } from "@/shared/supabase/server";
import { MAX_FOTOS_RESENA, nuevaResenaSchema, respuestaSchema } from "../domain/resena";
import { crearRepositorioResenas } from "../infrastructure/resenaRepository";

function revalidarResenas(emprendimientoId: string) {
  revalidatePath("/pedidos", "layout");
  revalidatePath("/panel", "layout");
  revalidatePath(`/emprendimientos/${emprendimientoId}`);
  revalidatePath("/");
}

function validarFotos(fotos: File[]): string | null {
  if (fotos.length > MAX_FOTOS_RESENA) return `Puedes subir máximo ${MAX_FOTOS_RESENA} fotos`;
  for (const foto of fotos) {
    const error = validarImagen(foto, "resenas");
    if (error) return error;
  }
  return null;
}

export async function crearResena(
  pedidoId: string,
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return { error: "Solo el cliente puede reseñar su pedido" };

  const datos = nuevaResenaSchema.safeParse({
    estrellas: texto(formData, "estrellas"),
    comentario: texto(formData, "comentario"),
  });
  if (!datos.success) return primerError(datos.error.issues);

  const fotos = archivos(formData, "fotos");
  const errorFotos = validarFotos(fotos);
  if (errorFotos) return { error: errorFotos };

  const supabase = await createClient();
  const pedido = await crearRepositorioPedidos(supabase).obtener(pedidoId);
  if (!pedido || pedido.cliente.id !== usuario.id) return { error: "No encontramos este pedido" };
  if (pedido.resena) return { error: "Ya dejaste una reseña para este pedido" };

  const resenas = crearRepositorioResenas(supabase);
  try {
    const resenaId = await resenas.crear(pedido.id, usuario.id, pedido.emprendimiento.id, datos.data);
    const urls = await Promise.all(fotos.map((foto) => subirImagen(supabase, "resenas", usuario.id, foto)));
    await resenas.agregarFotos(resenaId, urls);
  } catch (error) {
    console.error("[resenas:crear]", error);
    return { error: mensajeDeNegocio(error) ?? "No pudimos guardar tu reseña. Intenta de nuevo." };
  }

  revalidarResenas(pedido.emprendimiento.id);
  return { mensaje: "¡Gracias por tu reseña!" };
}

export async function responderResena(
  resenaId: string,
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const emprendimiento = await obtenerMiEmprendimiento();
  if (!emprendimiento) return { error: "No encontramos tu emprendimiento" };

  const respuesta = respuestaSchema.safeParse(texto(formData, "respuesta"));
  if (!respuesta.success) return primerError(respuesta.error.issues);

  const resenas = crearRepositorioResenas(await createClient());
  const resena = await resenas.obtener(resenaId);
  if (!resena || resena.emprendimientoId !== emprendimiento.id) return { error: "No encontramos esta reseña" };
  if (resena.respuesta) return { error: "Ya respondiste esta reseña" };

  try {
    await resenas.responder(resena.id, respuesta.data);
  } catch (error) {
    console.error("[resenas:responder]", error);
    return { error: mensajeDeNegocio(error) ?? "No pudimos guardar tu respuesta. Intenta de nuevo." };
  }

  revalidarResenas(emprendimiento.id);
  return {};
}
