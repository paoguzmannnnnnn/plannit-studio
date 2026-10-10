// Resultado de una validación sin lanzar excepciones
export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

type ResultadoZod<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: readonly { message: string }[] } };

export function desdeZod<T>(resultado: ResultadoZod<T>): Resultado<T> {
  return resultado.success
    ? { ok: true, valor: resultado.data }
    : { ok: false, error: resultado.error.issues[0]?.message ?? "Revisa los datos" };
}
