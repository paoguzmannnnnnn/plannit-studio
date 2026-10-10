"use server";

import type { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { primerError, type EstadoAccion } from "@/shared/acciones";
import { createClient } from "@/shared/supabase/server";
import { INICIO_POR_ROL, rutaSegura } from "../domain/acceso";
import { mensajeErrorAuth } from "../domain/errores";
import { loginSchema, registroSchema } from "../domain/schemas";

// Registra el error real en la terminal y devuelve un mensaje amigable al usuario
function falloDeAuth(operacion: string, error: AuthError): EstadoAccion {
  console.error(`[auth:${operacion}]`, error.code, error.message);
  return { error: mensajeErrorAuth(error.code) };
}

export async function registrarse(
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const resultado = registroSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) return primerError(resultado.error.issues);

  const { nombre, email, password, rol } = resultado.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, rol } },
  });

  if (error) return falloDeAuth("registro", error);
  if (!data.session) return { mensaje: "Te enviamos un correo para confirmar tu cuenta." };

  redirect(INICIO_POR_ROL[rol]);
}

export async function iniciarSesion(
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const resultado = loginSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) return primerError(resultado.error.issues);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(resultado.data);
  if (error) return falloDeAuth("login", error);

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", data.user.id)
    .single();

  const inicio = INICIO_POR_ROL[perfil?.rol ?? "cliente"];
  redirect(rutaSegura(formData.get("next"), inicio));
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
