"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";
import { colorDe, normalizarPaleta } from "@/features/colores/domain/colores";
import { crearRepositorioEmprendimientos } from "@/features/emprendimientos/infrastructure/emprendimientoRepository";
import type { Evento } from "@/features/eventos/domain/evento";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import type { ProductoPublico } from "@/features/explorar/domain/vistas";
import { crearRepositorioExplorar } from "@/features/explorar/infrastructure/explorarRepository";
import { archivo, primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { horasHasta } from "@/shared/fechas";
import { validarImagen } from "@/shared/storage/reglasImagenes";
import { subirImagen } from "@/shared/storage/subirImagen";
import { mensajeDeNegocio } from "@/shared/supabase/errores";
import { createClient } from "@/shared/supabase/server";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import { entero } from "@/shared/validaciones";
import {
  cantidadEnCarrito,
  itemParaSumar,
  personalizacionSchema,
  type OpcionesElegidas,
  type Personalizacion,
} from "../domain/carrito";
import { crearRepositorioCarrito } from "../infrastructure/carritoRepository";

const cantidadSchema = entero("Elige una cantidad válida", 1, 999);

type Contexto = { supabase: ClienteSupabase; usuarioId: string; evento: Evento };

// Solo el cliente dueño puede tocar el carrito de un evento que todavía no pasa
async function cargarEventoPropio(eventoId: string): Promise<Contexto | null> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return null;

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(eventoId);
  if (!evento || evento.clienteId !== usuario.id || horasHasta(evento.fechaEntrega) <= 0) return null;

  return { supabase, usuarioId: usuario.id, evento };
}

function revalidarCarrito(eventoId: string) {
  revalidatePath("/carrito");
  revalidatePath(`/eventos/${eventoId}`);
  revalidatePath(`/eventos/${eventoId}/carrito`);
}

type ResultadoColores = { ok: true; valor: string | undefined } | { ok: false; error: string };

// Colores tocados (solo los de la paleta del emprendimiento) + "otro color" escrito, en un solo texto
async function leerColores(formData: FormData, producto: ProductoPublico, contexto: Contexto): Promise<ResultadoColores> {
  if (producto.maxColores === 0) return { ok: true, valor: undefined };

  const paleta = await crearRepositorioEmprendimientos(contexto.supabase).paletaDe(producto.emprendimiento.id);
  const elegidos = normalizarPaleta(formData.getAll("color")).filter((id) => paleta.includes(id));
  if (elegidos.length > producto.maxColores) {
    return { ok: false, error: `Elige máximo ${producto.maxColores} ${producto.maxColores === 1 ? "color" : "colores"}` };
  }

  const otro = texto(formData, "colores").trim();
  const partes = [...elegidos.map((id) => colorDe(id).nombre), ...(otro ? [otro] : [])];
  return { ok: true, valor: partes.join(", ") || undefined };
}

// Tamaño (obligatorio si el producto tiene) y extras: solo se aceptan los del producto
function leerOpciones(
  formData: FormData,
  producto: ProductoPublico,
): { ok: true; valor: OpcionesElegidas } | { ok: false; error: string } {
  const tamanoId = texto(formData, "tamano") || null;
  if (producto.tamanos.length > 0 && !producto.tamanos.some((tamano) => tamano.id === tamanoId)) {
    return { ok: false, error: "Elige un tamaño" };
  }

  const pedidos = new Set(formData.getAll("extra"));
  const extrasIds = producto.extras.filter((extra) => pedidos.has(extra.id)).map((extra) => extra.id);
  return { ok: true, valor: { tamanoId: producto.tamanos.length > 0 ? tamanoId : null, extrasIds } };
}

// Solo se aceptan los campos que el producto permite personalizar
async function leerPersonalizacion(
  formData: FormData,
  producto: ProductoPublico,
  contexto: Contexto,
): Promise<{ ok: true; valor: Personalizacion } | { ok: false; error: string }> {
  // Los colores valen para los dos tipos de producto
  const colores = await leerColores(formData, producto, contexto);
  if (!colores.ok) return colores;

  if (!ESTRATEGIAS_TIPO[producto.tipo].admitePersonalizacion) {
    return { ok: true, valor: colores.valor ? { colores: colores.valor } : {} };
  }

  const opcional = (campo: string, permitido: boolean) =>
    permitido ? texto(formData, campo).trim() || undefined : undefined;

  const resultado = personalizacionSchema.safeParse({
    colores: colores.valor,
    texto: opcional("texto", producto.permiteTexto),
    notas: opcional("notas", true),
  });
  if (!resultado.success) return { ok: false, error: resultado.error.issues[0]?.message ?? "Revisa los datos" };

  const referencia = producto.permiteReferencia ? archivo(formData, "referencia") : null;
  if (!referencia) return { ok: true, valor: resultado.data };

  const errorImagen = validarImagen(referencia, "referencias");
  if (errorImagen) return { ok: false, error: errorImagen };

  const referenciaUrl = await subirImagen(contexto.supabase, "referencias", contexto.usuarioId, referencia);
  return { ok: true, valor: { ...resultado.data, referenciaUrl } };
}

export async function agregarAlCarrito(
  eventoId: string,
  productoId: string,
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const contexto = await cargarEventoPropio(eventoId);
  if (!contexto) return { error: "No encontramos tu evento" };

  const cantidad = cantidadSchema.safeParse(texto(formData, "cantidad"));
  if (!cantidad.success) return primerError(cantidad.error.issues);

  const carrito = crearRepositorioCarrito(contexto.supabase);
  const [producto, disponibilidad, items] = await Promise.all([
    crearRepositorioExplorar(contexto.supabase).obtenerProducto(productoId),
    carrito.disponibilidad(eventoId),
    carrito.listarItems(eventoId),
  ]);

  const disponible = disponibilidad.get(productoId);
  if (!producto || !disponible) return { error: "Este producto ya no llega a tiempo para tu evento" };

  const restantes = disponible.disponibles - cantidadEnCarrito(items, productoId);
  if (cantidad.data > restantes) {
    return {
      error: restantes > 0 ? `Solo quedan ${restantes} para tu fecha` : "Ya tienes en tu plan todo lo disponible",
    };
  }

  const opciones = leerOpciones(formData, producto);
  if (!opciones.ok) return { error: opciones.error };

  try {
    const personalizacion = await leerPersonalizacion(formData, producto, contexto);
    if (!personalizacion.ok) return { error: personalizacion.error };

    const existente = itemParaSumar(items, productoId, personalizacion.valor, opciones.valor);
    if (existente) {
      await carrito.cambiarCantidad(eventoId, existente.id, existente.cantidad + cantidad.data);
    } else {
      await carrito.agregar(eventoId, productoId, cantidad.data, personalizacion.valor, opciones.valor);
    }
  } catch (error) {
    console.error("[carrito:agregar]", error);
    return { error: "No pudimos agregarlo. Intenta de nuevo." };
  }

  revalidarCarrito(eventoId);
  revalidatePath(`/productos/${productoId}`);
  return { mensaje: "Listo, ya está en tu plan" };
}

export async function cambiarCantidad(eventoId: string, itemId: string, cantidad: number): Promise<void> {
  const contexto = await cargarEventoPropio(eventoId);
  if (!contexto || !Number.isInteger(cantidad)) return;

  const carrito = crearRepositorioCarrito(contexto.supabase);
  if (cantidad <= 0) {
    await carrito.quitar(eventoId, itemId);
  } else {
    const [items, disponibilidad] = await Promise.all([carrito.listarItems(eventoId), carrito.disponibilidad(eventoId)]);
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const disponibles = disponibilidad.get(item.productoId)?.disponibles ?? 0;
    const totalNuevo = cantidadEnCarrito(items, item.productoId) - item.cantidad + cantidad;
    // Bajar siempre se permite; subir solo si alcanza
    if (cantidad > item.cantidad && totalNuevo > disponibles) return;

    await carrito.cambiarCantidad(eventoId, itemId, cantidad);
  }

  revalidarCarrito(eventoId);
}

export async function quitarDelCarrito(eventoId: string, itemId: string): Promise<void> {
  const contexto = await cargarEventoPropio(eventoId);
  if (!contexto) return;

  await crearRepositorioCarrito(contexto.supabase).quitar(eventoId, itemId);
  revalidarCarrito(eventoId);
}

export async function confirmarOrden(eventoId: string, _estado: EstadoAccion): Promise<EstadoAccion> {
  const contexto = await cargarEventoPropio(eventoId);
  if (!contexto) return { error: "No encontramos tu evento" };

  let ordenId: string;
  try {
    ordenId = await crearRepositorioCarrito(contexto.supabase).confirmar(eventoId);
  } catch (error) {
    console.error("[carrito:confirmar]", error);
    revalidarCarrito(eventoId);
    return { error: mensajeDeNegocio(error) ?? "No pudimos confirmar tu orden. Intenta de nuevo." };
  }

  revalidarCarrito(eventoId);
  redirect(`/pedidos/${ordenId}`);
}
