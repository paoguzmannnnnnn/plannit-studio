import type { CamposTipo } from "./producto";

// Qué puede personalizar el cliente en un producto personalizable
export const OPCIONES_PERSONALIZACION = [
  { campo: "permite_colores", etiqueta: "Colores", clave: "permiteColores" },
  { campo: "permite_texto", etiqueta: "Texto o nombre", clave: "permiteTexto" },
  { campo: "permite_referencia", etiqueta: "Foto de referencia", clave: "permiteReferencia" },
] as const satisfies readonly { campo: string; etiqueta: string; clave: keyof CamposTipo }[];

export function personalizacionesPermitidas(campos: CamposTipo): string[] {
  return OPCIONES_PERSONALIZACION.filter((opcion) => campos[opcion.clave]).map(
    (opcion) => opcion.etiqueta,
  );
}
