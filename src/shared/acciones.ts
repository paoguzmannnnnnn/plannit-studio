// Estado común que devuelven todas las server actions de formularios
export type EstadoAccion = { error?: string; mensaje?: string };

export const ESTADO_INICIAL: EstadoAccion = {};

export function primerError(issues: readonly { message: string }[]): EstadoAccion {
  return { error: issues[0]?.message ?? "Revisa los datos" };
}

// ---- Lectura de FormData sin arrastrar null ni archivos vacíos por la app ----

export function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

function esArchivoConContenido(valor: FormDataEntryValue): valor is File {
  return valor instanceof File && valor.size > 0;
}

export function archivo(formData: FormData, campo: string): File | null {
  const valor = formData.get(campo);
  return valor && esArchivoConContenido(valor) ? valor : null;
}

export function archivos(formData: FormData, campo: string): File[] {
  return formData.getAll(campo).filter(esArchivoConContenido);
}
