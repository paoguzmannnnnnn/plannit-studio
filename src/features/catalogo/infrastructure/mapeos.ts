import type { Database } from "@/shared/supabase/database.types";
import type { CamposTipo, Extra, Tamano } from "../domain/producto";

type Tablas = Database["public"]["Tables"];
type FilaProducto = Tablas["productos"]["Row"];

type ColumnasTipo = Pick<
  FilaProducto,
  "stock_por_fecha" | "cupo_diario" | "anticipacion_horas" | "permite_texto" | "permite_referencia"
>;

// Columnas que cualquier consulta debe traer para poder usar las estrategias de tipo
export const COLUMNAS_TIPO =
  "stock_por_fecha, cupo_diario, anticipacion_horas, permite_texto, permite_referencia" as const;

// Tamaños y extras, ordenados como los dejó el emprendedor
export const SELECT_OPCIONES =
  "producto_tamanos(id, nombre, detalle, precio_centavos, orden), producto_extras(id, nombre, precio_centavos, orden)" as const;

export type FilaTamano = Pick<Tablas["producto_tamanos"]["Row"], "id" | "nombre" | "detalle" | "precio_centavos" | "orden">;
export type FilaExtra = Pick<Tablas["producto_extras"]["Row"], "id" | "nombre" | "precio_centavos" | "orden">;

export function aCamposTipo(fila: ColumnasTipo): CamposTipo {
  return {
    stockPorFecha: fila.stock_por_fecha,
    cupoDiario: fila.cupo_diario,
    anticipacionHoras: fila.anticipacion_horas,
    permiteTexto: fila.permite_texto,
    permiteReferencia: fila.permite_referencia,
  };
}

export function aColumnasTipo(campos: CamposTipo): ColumnasTipo {
  return {
    stock_por_fecha: campos.stockPorFecha,
    cupo_diario: campos.cupoDiario,
    anticipacion_horas: campos.anticipacionHoras,
    permite_texto: campos.permiteTexto,
    permite_referencia: campos.permiteReferencia,
  };
}

const porOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden;

export function aTamanos(filas: readonly FilaTamano[]): Tamano[] {
  return [...filas].sort(porOrden).map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    detalle: fila.detalle,
    precioCentavos: fila.precio_centavos,
  }));
}

export function aExtras(filas: readonly FilaExtra[]): Extra[] {
  return [...filas].sort(porOrden).map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    precioCentavos: fila.precio_centavos,
  }));
}

// Fotos ordenadas por "orden"; la primera es la portada
export function urlsOrdenadas(fotos: readonly { url: string; orden: number }[]): string[] {
  return [...fotos].sort(porOrden).map((foto) => foto.url);
}
