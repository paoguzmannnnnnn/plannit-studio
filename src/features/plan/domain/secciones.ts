import { TIPOS_EVENTO, type TipoEvento } from "@/features/eventos/domain/evento";

// Partes de un evento. Cada una agrupa categorías del catálogo de decoración.
type DefinicionSeccion = {
  nombre: string;
  detalle: string;
  categorias: readonly string[];
};

export const SECCIONES = {
  backdrop: { nombre: "Backdrop", detalle: "La zona de fotos", categorias: ["Backdrops"] },
  globos: { nombre: "Globos", detalle: "Arcos, columnas y bouquets", categorias: ["Globos"] },
  mesas: {
    nombre: "Mesas",
    detalle: "Centros de mesa y mobiliario",
    categorias: ["Centros de mesa", "Mobiliario decorativo"],
  },
  mesa_dulce: { nombre: "Mesa dulce", detalle: "Postres y candy bar", categorias: ["Mesas dulces"] },
  letrero: { nombre: "Letrero", detalle: "Neones, letras y bienvenida", categorias: ["Letreros"] },
  flores: { nombre: "Flores", detalle: "Arreglos y arcos florales", categorias: ["Arreglos florales"] },
} as const satisfies Record<string, DefinicionSeccion>;

export type IdSeccion = keyof typeof SECCIONES;

const IDS = Object.keys(SECCIONES) as IdSeccion[];

export function esIdSeccion(valor: unknown): valor is IdSeccion {
  return typeof valor === "string" && (IDS as string[]).includes(valor);
}

// Plan sugerido por tipo de evento, en orden de importancia:
// primero las mesas (la base), luego la decoración principal y al final los detalles
const PLANTILLAS: Record<TipoEvento, readonly IdSeccion[]> = {
  Cumpleaños: ["mesas", "backdrop", "globos", "mesa_dulce", "letrero"],
  "Baby shower": ["mesas", "backdrop", "globos", "mesa_dulce", "letrero"],
  Boda: ["mesas", "flores", "backdrop", "mesa_dulce", "letrero"],
  Graduación: ["mesas", "backdrop", "globos", "letrero"],
  "Bautizo o primera comunión": ["mesas", "flores", "globos", "mesa_dulce"],
  "Fiesta privada": ["mesas", "backdrop", "globos", "letrero"],
  "Evento corporativo": ["mesas", "backdrop", "flores", "letrero"],
  Otro: ["mesas", "backdrop", "globos", "flores", "mesa_dulce", "letrero"],
};

function esTipoEvento(tipo: string): tipo is TipoEvento {
  return (TIPOS_EVENTO as readonly string[]).includes(tipo);
}

export function plantillaDe(tipoEvento: string): readonly IdSeccion[] {
  return PLANTILLAS[esTipoEvento(tipoEvento) ? tipoEvento : "Otro"];
}

export function perteneceA(seccion: IdSeccion, categoria: string | undefined): boolean {
  return categoria !== undefined && (SECCIONES[seccion].categorias as readonly string[]).includes(categoria);
}
