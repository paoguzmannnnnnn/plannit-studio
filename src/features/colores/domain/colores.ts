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

// Colores propios: el emprendedor elige el tono y le pone nombre.
// El id lleva todo lo necesario ("#a8d84e|Verde limón"), así se pinta sin consultar nada más.
export type IdColorBase = (typeof COLORES)[number]["id"];
export type IdColorPropio = `#${string}|${string}`;
export type IdColor = IdColorBase | IdColorPropio;

export type Color = { id: IdColor; nombre: string; hex: string; propio: boolean };

export const MAX_COLORES_PROPIOS = 8;
export const MAX_NOMBRE_COLOR = 24;

// Atajos para armar la paleta en dos toques
export const ATAJOS_PALETA: readonly { nombre: string; colores: readonly IdColorBase[] }[] = [
  { nombre: "Pasteles", colores: ["rosa_pastel", "celeste", "lila", "verde_menta", "amarillo_pastel", "durazno"] },
  { nombre: "Metálicos", colores: ["dorado", "plateado", "oro_rosa"] },
  { nombre: "Neutros", colores: ["blanco", "marfil", "cafe", "negro"] },
  { nombre: "Vivos", colores: ["fucsia", "rojo", "naranja", "amarillo", "azul_rey", "verde_esmeralda", "morado"] },
];

// Máximo que un emprendedor puede permitir por producto (cada producto define el suyo)
export const MAX_COLORES_PRODUCTO = 5;

const POR_ID = new Map<string, Color>(COLORES.map((color) => [color.id, { ...color, propio: false }]));
const PATRON_PROPIO = /^#[0-9a-f]{6}\|[^|]+$/;

/** Arma el id de un color propio; null si el tono o el nombre no sirven */
export function crearColorPropio(hex: string, nombre: string): IdColorPropio | null {
  const tono = hex.trim().toLowerCase();
  const limpio = nombre.replace(/\|/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_NOMBRE_COLOR);
  if (!/^#[0-9a-f]{6}$/.test(tono) || limpio.length === 0) return null;
  return `${tono}|${limpio}` as IdColorPropio;
}

export function esColorPropio(valor: unknown): valor is IdColorPropio {
  return typeof valor === "string" && valor.length <= 8 + MAX_NOMBRE_COLOR && PATRON_PROPIO.test(valor);
}

export function esIdColor(valor: unknown): valor is IdColor {
  return (typeof valor === "string" && POR_ID.has(valor)) || esColorPropio(valor);
}

export function colorDe(id: IdColor): Color {
  const base = POR_ID.get(id);
  if (base) return base;
  const [hex, nombre] = id.split("|");
  return { id, nombre, hex, propio: true };
}

// Limpia lo que venga de la base de datos o de un formulario: solo ids válidos, sin repetir.
// Primero los del catálogo (en su orden) y después los propios (en el orden en que se agregaron).
export function normalizarPaleta(valores: readonly unknown[]): IdColor[] {
  const elegidos = new Set(valores.filter(esIdColor));
  const base = COLORES.map((color) => color.id).filter((id) => elegidos.has(id));
  const propios = [...elegidos].filter(esColorPropio);
  // El mismo tono no se repite aunque tenga otro nombre
  const tonos = new Set<string>();
  const unicos = propios.filter((id) => {
    const hex = id.split("|")[0];
    if (tonos.has(hex)) return false;
    tonos.add(hex);
    return true;
  });
  return [...base, ...unicos.slice(0, MAX_COLORES_PROPIOS)];
}
