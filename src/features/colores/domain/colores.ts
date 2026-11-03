// Colores comunes en decoración. El emprendedor arma su paleta tocándolos (sin escribir)
// y el cliente elige de esa paleta.
export const COLORES = [
  { id: "blanco", nombre: "Blanco", hex: "#FFFFFF" },
  { id: "marfil", nombre: "Marfil", hex: "#F3EBDD" },
  { id: "rosa_pastel", nombre: "Rosa pastel", hex: "#F8C8D4" },
  { id: "rosa_palo", nombre: "Rosa palo", hex: "#D9A5A9" },
  { id: "fucsia", nombre: "Fucsia", hex: "#E0367A" },
  { id: "rojo", nombre: "Rojo", hex: "#D62F3A" },
  { id: "durazno", nombre: "Durazno", hex: "#F9C5A6" },
  { id: "naranja", nombre: "Naranja", hex: "#F28A3B" },
  { id: "amarillo_pastel", nombre: "Amarillo pastel", hex: "#F7E3A1" },
  { id: "amarillo", nombre: "Amarillo", hex: "#F5C518" },
  { id: "verde_menta", nombre: "Verde menta", hex: "#BDE5CF" },
  { id: "verde_salvia", nombre: "Verde salvia", hex: "#A8B89A" },
  { id: "verde_esmeralda", nombre: "Verde esmeralda", hex: "#1E7A5A" },
  { id: "celeste", nombre: "Celeste", hex: "#B9DDF2" },
  { id: "azul_rey", nombre: "Azul rey", hex: "#2B4BA8" },
  { id: "azul_marino", nombre: "Azul marino", hex: "#1E2A4A" },
  { id: "lila", nombre: "Lila", hex: "#C9B6E4" },
  { id: "morado", nombre: "Morado", hex: "#6B3FA0" },
  { id: "terracota", nombre: "Terracota", hex: "#C8693F" },
  { id: "cafe", nombre: "Café", hex: "#7A5136" },
  { id: "negro", nombre: "Negro", hex: "#1A1A1A" },
  { id: "dorado", nombre: "Dorado", hex: "#C9A227" },
  { id: "plateado", nombre: "Plateado", hex: "#BFC3C7" },
  { id: "oro_rosa", nombre: "Oro rosa", hex: "#E3B7A0" },
] as const;

export type Color = (typeof COLORES)[number];
export type IdColor = Color["id"];

// Atajos para armar la paleta en dos toques
export const ATAJOS_PALETA: readonly { nombre: string; colores: readonly IdColor[] }[] = [
  { nombre: "Pasteles", colores: ["rosa_pastel", "celeste", "lila", "verde_menta", "amarillo_pastel", "durazno"] },
  { nombre: "Metálicos", colores: ["dorado", "plateado", "oro_rosa"] },
  { nombre: "Neutros", colores: ["blanco", "marfil", "cafe", "negro"] },
  { nombre: "Vivos", colores: ["fucsia", "rojo", "naranja", "amarillo", "azul_rey", "verde_esmeralda", "morado"] },
];

// Máximo que un emprendedor puede permitir por producto (cada producto define el suyo)
export const MAX_COLORES_PRODUCTO = 5;

const POR_ID = new Map<string, Color>(COLORES.map((color) => [color.id, color]));

export function esIdColor(valor: unknown): valor is IdColor {
  return typeof valor === "string" && POR_ID.has(valor);
}

export function colorDe(id: IdColor): Color {
  return POR_ID.get(id) as Color;
}

// Limpia lo que venga de la base de datos o de un formulario: solo ids válidos, sin repetir,
// en el orden del catálogo
export function normalizarPaleta(valores: readonly unknown[]): IdColor[] {
  const elegidos = new Set(valores.filter(esIdColor));
  return COLORES.map((color) => color.id).filter((id) => elegidos.has(id));
}
