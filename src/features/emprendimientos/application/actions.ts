"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { archivo, primerError, texto, type EstadoAccion } from "@/shared/acciones";
import { eliminarImagen } from "@/shared/storage/eliminarImagen";
import { validarImagen } from "@/shared/storage/reglasImagenes";
import { subirImagen } from "@/shared/storage/subirImagen";
import { esViolacionDeUnicidad, mensajeDeNegocio } from "@/shared/supabase/errores";
import { createClient } from "@/shared/supabase/server";
import type { ZonaCobertura } from "../domain/emprendimiento";
import { datosEmprendimientoSchema } from "../domain/schemas";
import { crearRepositorioEmprendimientos } from "../infrastructure/emprendimientoRepository";
import { obtenerMiEmprendimiento } from "./miEmprendimiento";

const ERROR_GUARDAR = "No pudimos guardar tu emprendimiento. Intenta de nuevo.";

type FormularioValido = {
  ok: true;
  datos: { nombre: string; descripcion: string | null; zonas: ZonaCobertura[] };
  logo: File | null;
};
type FormularioInvalido = { ok: false; estado: EstadoAccion };

// El formulario manda un checkbox "zona" por cada zona marcada y un input "costo_<id>" por cada una
function leerZonas(formData: FormData) {
  return formData.getAll("zona").map((zonaId) => ({
    zonaId: Number(zonaId),
    costoEnvio: texto(formData, `costo_${zonaId}`).trim() || "0",
  }));
}

// Valida el formulario completo (datos + logo) igual para crear y editar
function leerFormulario(formData: FormData): FormularioValido | FormularioInvalido {
  const datos = datosEmprendimientoSchema.safeParse({
    nombre: texto(formData, "nombre"),
    descripcion: texto(formData, "descripcion"),
    zonas: leerZonas(formData),
  });
  if (!datos.success) return { ok: false, estado: primerError(datos.error.issues) };

  const logo = archivo(formData, "logo");
  const errorLogo = logo ? validarImagen(logo, "logos") : null;
  if (errorLogo) return { ok: false, estado: { error: errorLogo } };

  return { ok: true, datos: datos.data, logo };
}

export async function crearEmprendimiento(
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "emprendedor") {
    return { error: "Solo los emprendedores pueden registrar un emprendimiento" };
  }

  const formulario = leerFormulario(formData);
  if (!formulario.ok) return formulario.estado;

  const supabase = await createClient();
  try {
    const logoUrl = formulario.logo
      ? await subirImagen(supabase, "logos", usuario.id, formulario.logo)
      : null;
    await crearRepositorioEmprendimientos(supabase).crear({ ...formulario.datos, logoUrl });
  } catch (error) {
    console.error("[emprendimientos:crear]", error);
    return { error: esViolacionDeUnicidad(error) ? "Ya tienes un emprendimiento registrado" : ERROR_GUARDAR };
  }

  redirect("/panel");
}

export async function actualizarEmprendimiento(
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const [usuario, actual] = await Promise.all([obtenerUsuarioActual(), obtenerMiEmprendimiento()]);
  if (!usuario || !actual) return { error: "No encontramos tu emprendimiento" };

  const formulario = leerFormulario(formData);
  if (!formulario.ok) return formulario.estado;

  const supabase = await createClient();
  try {
    // Si no sube logo nuevo, se conserva el que ya tenía
    const logoUrl = formulario.logo
      ? await subirImagen(supabase, "logos", usuario.id, formulario.logo)
      : actual.logoUrl;
    await crearRepositorioEmprendimientos(supabase).actualizar({ ...formulario.datos, logoUrl });

    if (formulario.logo && actual.logoUrl) {
      await eliminarImagen(supabase, "logos", actual.logoUrl).catch((error) =>
        console.error("[emprendimientos:logoAnterior]", error),
      );
    }
  } catch (error) {
    console.error("[emprendimientos:actualizar]", error);
    return { error: mensajeDeNegocio(error) ?? ERROR_GUARDAR };
  }

  revalidatePath("/panel", "layout");
  revalidatePath(`/emprendimientos/${actual.id}`);
  return { mensaje: "Cambios guardados" };
}