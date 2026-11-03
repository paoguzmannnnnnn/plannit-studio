import { TIPOS_EVENTO, type TipoEvento } from "@/features/eventos/domain/evento";

// Partes de un evento. Cada una agrupa categorías del catálogo de decoración.
type DefinicionSeccion = {
  nombre: string;
  detalle: string;
  categorias: readonly string[];
};

// El orden de este objeto es el orden del plan: primero las mesas (la base),
// luego la decoración principal y al final los detalles
export const SECCIONES = {
  mesas: {
    nombre: "Mesas",
    detalle: "Centros de mesa y mobiliario",
    categorias: ["Centros de mesa", "Mobiliario decorativo"],
  },
  backdrop: { nombre: "Backdrop", detalle: "La zona de fotos", categorias: ["Backdrops"] },
  globos: { nombre: "Globos", detalle: "Arcos, columnas y bouquets", categorias: ["Globos"] },
  flores: { nombre: "Flores", detalle: "Arreglos y arcos florales", categorias: ["Arreglos florales"] },
  mesa_dulce: { nombre: "Mesa dulce", detalle: "Postres y candy bar", categorias: ["Mesas dulces"] },
  letrero: { nombre: "Letrero", detalle: "Neones, letras y bienvenida", categorias: ["Letreros"] },
} as const satisfies Record<string, DefinicionSeccion>;

export type IdSeccion = keyof typeof SECCIONES;

export const IDS_SECCIONES = Object.keys(SECCIONES) as IdSeccion[];

export function esIdSeccion(valor: unknown): valor is IdSeccion {
  return typeof valor === "string" && (IDS_SECCIONES as string[]).includes(valor);
}

// Solo pasos válidos, sin repetir y siempre en el orden del plan
export function normalizarPasos(valores: readonly unknown[]): IdSeccion[] {
  const elegidos = new Set(valores.filter(esIdSeccion));
  return IDS_SECCIONES.filter((id) => elegidos.has(id));
}

// Sugerencia al crear el evento (el cliente la ajusta). La misma lista vive en
// la función pasos_sugeridos de la base de datos, para los eventos que ya existían.
const SUGERENCIAS: Record<TipoEvento, readonly IdSeccion[]> = {
  Cumpleaños: ["mesas", "backdrop", "globos", "mesa_dulce", "letrero"],
  "Baby shower": ["mesas", "backdrop", "globos", "mesa_dulce", "letrero"],
  Boda: ["mesas", "backdrop", "flores", "mesa_dulce", "letrero"],
  Graduación: ["mesas", "backdrop", "globos", "letrero"],
  "Bautizo o primera comunión": ["mesas", "globos", "flores", "mesa_dulce"],
  "Fiesta privada": ["mesas", "backdrop", "globos", "letrero"],
  "Evento corporativo": ["mesas", "backdrop", "flores", "letrero"],
  Otro: ["mesas", "backdrop", "globos", "flores", "mesa_dulce", "letrero"],
};

function esTipoEvento(tipo: string): tipo is TipoEvento {
  return (TIPOS_EVENTO as readonly string[]).includes(tipo);
}

export function pasosSugeridos(tipoEvento: string): readonly IdSeccion[] {
  return SUGERENCIAS[esTipoEvento(tipoEvento) ? tipoEvento : "Otro"];
}

// Los pasos del evento; si alguno viejo no tiene, se usa la sugerencia de su tipo
export function pasosDe(evento: { pasos: readonly string[]; tipo: string }): IdSeccion[] {
  const pasos = normalizarPasos(evento.pasos);
  return pasos.length > 0 ? pasos : [...pasosSugeridos(evento.tipo)];
}

export function perteneceA(seccion: IdSeccion, categoria: string | undefined): boolean {
  return categoria !== undefined && (SECCIONES[seccion].categorias as readonly string[]).includes(categoria);
}
