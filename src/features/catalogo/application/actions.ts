"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { obtenerMiEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { archivos, primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { eliminarImagen } from "@/shared/storage/eliminarImagen";
import { validarImagen } from "@/shared/storage/reglasImagenes";
import { subirImagen } from "@/shared/storage/subirImagen";
import { createClient } from "@/shared/supabase/server";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import { MAX_FOTOS_PRODUCTO, type Producto, type ProductoRepository } from "../domain/producto";
import { datosComunesSchema, tipoProductoSchema } from "../domain/schemas";
import { ESTRATEGIAS_TIPO } from "../domain/tiposProducto";
import { crearRepositorioProductos } from "../infrastructure/productoRepository";

const RUTA_CATALOGO = "/panel/catalogo";
const ERROR_GUARDAR = "No pudimos guardar el producto. Intenta de nuevo.";

// ---------------- Helpers ----------------

function leerDatosComunes(formData: FormData) {
  return datosComunesSchema.safeParse({
    nombre: texto(formData, "nombre"),
    descripcion: texto(formData, "descripcion"),
    categoriaId: texto(formData, "categoria"),
    precioCentavos: texto(formData, "precio"),
  });
}

function validarFotos(fotos: File[], disponibles: number): string | null {
  if (fotos.length > disponibles) {
    return disponibles === 0
      ? `Ya tienes el máximo de ${MAX_FOTOS_PRODUCTO} fotos`
      : `Puedes agregar máximo ${disponibles} ${disponibles === 1 ? "foto" : "fotos"} más`;
  }
  for (const foto of fotos) {
    const error = validarImagen(foto, "productos");
    if (error) return error;
  }
  return null;
}

function subirFotos(supabase: ClienteSupabase, usuarioId: string, fotos: File[]) {
  return Promise.all(fotos.map((foto) => subirImagen(supabase, "productos", usuarioId, foto)));
}

type ContextoProducto = {
  producto: Producto;
  repositorio: ProductoRepository;
  supabase: ClienteSupabase;
  usuarioId: string;
};

// Carga el producto solo si pertenece al emprendimiento del usuario actual
async function cargarProductoPropio(productoId: string): Promise<ContextoProducto | null> {
  const [usuario, emprendimiento] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerMiEmprendimiento(),
  ]);
  if (!usuario || !emprendimiento) return null;

  const supabase = await createClient();
  const repositorio = crearRepositorioProductos(supabase);
  const producto = await repositorio.obtener(productoId);

  return producto?.emprendimientoId === emprendimiento.id
    ? { producto, repositorio, supabase, usuarioId: usuario.id }
    : null;
}

function revalidarProducto(productoId: string) {
  revalidatePath(RUTA_CATALOGO);
  revalidatePath(`${RUTA_CATALOGO}/${productoId}`);
}

// ---------------- Acciones ----------------

export async function crearProducto(
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const [usuario, emprendimiento] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerMiEmprendimiento(),
  ]);
  if (!usuario || !emprendimiento) return { error: "Primero registra tu emprendimiento" };

  const tipo = tipoProductoSchema.safeParse(texto(formData, "tipo"));
  if (!tipo.success) return primerError(tipo.error.issues);

  const comunes = leerDatosComunes(formData);
  if (!comunes.success) return primerError(comunes.error.issues);

  const campos = ESTRATEGIAS_TIPO[tipo.data].parsear(Object.fromEntries(formData));
  if (!campos.ok) return { error: campos.error };

  const fotos = archivos(formData, "fotos");
  if (fotos.length === 0) return { error: "Agrega al menos una foto del producto" };
  const errorFotos = validarFotos(fotos, MAX_FOTOS_PRODUCTO);
  if (errorFotos) return { error: errorFotos };

  const supabase = await createClient();

  try {
    const fotosUrls = await subirFotos(supabase, usuario.id, fotos);
    await crearRepositorioProductos(supabase).crear(emprendimiento.id, {
      tipo: tipo.data,
      ...comunes.data,
      ...campos.valor,
      fotosUrls,
    });
  } catch (error) {
    console.error("[catalogo:crear]", error);
    return { error: ERROR_GUARDAR };
  }

  revalidatePath(RUTA_CATALOGO);
  redirect(RUTA_CATALOGO);
}

export async function actualizarProducto(
  productoId: string,
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const contexto = await cargarProductoPropio(productoId);
  if (!contexto) return { error: "No encontramos este producto" };
  const { producto, repositorio, supabase, usuarioId } = contexto;

  const comunes = leerDatosComunes(formData);
  if (!comunes.success) return primerError(comunes.error.issues);

  // El tipo no cambia al editar: se usa la estrategia del tipo guardado
  const campos = ESTRATEGIAS_TIPO[producto.tipo].parsear(Object.fromEntries(formData));
  if (!campos.ok) return { error: campos.error };

  const fotosNuevas = archivos(formData, "fotos");
  const errorFotos = validarFotos(fotosNuevas, MAX_FOTOS_PRODUCTO - producto.fotos.length);
  if (errorFotos) return { error: errorFotos };

  try {
    const urls = await subirFotos(supabase, usuarioId, fotosNuevas);
    await repositorio.actualizar(producto.id, { ...comunes.data, ...campos.valor });
    await repositorio.agregarFotos(producto.id, urls, producto.fotos.length);
  } catch (error) {
    console.error("[catalogo:actualizar]", error);
    return { error: ERROR_GUARDAR };
  }

  revalidarProducto(producto.id);
  return { mensaje: "Cambios guardados" };
}

export async function cambiarActivo(productoId: string, activo: boolean): Promise<void> {
  const contexto = await cargarProductoPropio(productoId);
  if (!contexto) return;

  await contexto.repositorio.cambiarActivo(productoId, activo);
  revalidarProducto(productoId);
}

export async function eliminarFoto(productoId: string, fotoId: string): Promise<void> {
  const contexto = await cargarProductoPropio(productoId);
  if (!contexto) return;

  const { producto, repositorio, supabase } = contexto;
  const foto = producto.fotos.find((f) => f.id === fotoId);
  // Un producto siempre conserva al menos una foto
  if (!foto || producto.fotos.length <= 1) return;

  await repositorio.eliminarFoto(foto.id);
  try {
    await eliminarImagen(supabase, "productos", foto.url);
  } catch (error) {
    // La foto ya no se muestra; si el archivo queda huérfano no afecta al usuario
    console.error("[catalogo:eliminarFoto]", error);
  }

  revalidarProducto(productoId);
}
