type ErrorConCodigo = { code: string; message: string };

function tieneCodigo(error: unknown): error is ErrorConCodigo {
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

// 23505 = unique_violation en Postgres
export function esViolacionDeUnicidad(error: unknown): boolean {
  return tieneCodigo(error) && error.code === "23505";
}

// P0001 / P0002 son los errores que lanzan nuestras funciones SQL con mensajes
// ya escritos para el usuario ("El carrito está vacío", "Evento no encontrado"…)
const CODIGOS_DE_NEGOCIO = new Set(["P0001", "P0002"]);

export function mensajeDeNegocio(error: unknown): string | null {
  return tieneCodigo(error) && CODIGOS_DE_NEGOCIO.has(error.code) ? error.message : null;
}
