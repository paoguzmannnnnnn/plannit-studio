import type { CamposTipo, Opciones } from "./producto";

// Lo que puede personalizar el cliente además de los colores (solo personalizables)
export const OPCIONES_PERSONALIZACION = [
  { campo: "permite_texto", etiqueta: "Texto o nombre", clave: "permiteTexto" },
  { campo: "permite_referencia", etiqueta: "Foto de referencia", clave: "permiteReferencia" },
] as const satisfies readonly { campo: string; etiqueta: string; clave: keyof CamposTipo }[];

export function personalizacionesPermitidas(producto: CamposTipo & Pick<Opciones, "maxColores">): string[] {
  const colores =
    producto.maxColores > 0
      ? [`Hasta ${producto.maxColores} ${producto.maxColores === 1 ? "color" : "colores"}`]
      : [];
  return [
    ...colores,
    ...OPCIONES_PERSONALIZACION.filter((opcion) => producto[opcion.clave]).map((opcion) => opcion.etiqueta),
  ];
}
