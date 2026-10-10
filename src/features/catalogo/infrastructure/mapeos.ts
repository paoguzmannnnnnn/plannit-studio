import type { Database } from "@/shared/supabase/database.types";
import type { CamposTipo } from "../domain/producto";

type FilaProducto = Database["public"]["Tables"]["productos"]["Row"];

type ColumnasTipo = Pick<
  FilaProducto,
  | "stock_por_fecha"
  | "cupo_diario"
  | "anticipacion_horas"
  | "permite_colores"
  | "permite_texto"
  | "permite_referencia"
>;

// Columnas que cualquier consulta debe traer para poder usar las estrategias de tipo
export const COLUMNAS_TIPO =
  "stock_por_fecha, cupo_diario, anticipacion_horas, permite_colores, permite_texto, permite_referencia" as const;

export function aCamposTipo(fila: ColumnasTipo): CamposTipo {
  return {
    stockPorFecha: fila.stock_por_fecha,
    cupoDiario: fila.cupo_diario,
    anticipacionHoras: fila.anticipacion_horas,
    permiteColores: fila.permite_colores,
    permiteTexto: fila.permite_texto,
    permiteReferencia: fila.permite_referencia,
  };
}

export function aColumnasTipo(campos: CamposTipo): ColumnasTipo {
  return {
    stock_por_fecha: campos.stockPorFecha,
    cupo_diario: campos.cupoDiario,
    anticipacion_horas: campos.anticipacionHoras,
    permite_colores: campos.permiteColores,
    permite_texto: campos.permiteTexto,
    permite_referencia: campos.permiteReferencia,
  };
}

// Fotos ordenadas por "orden"; la primera es la portada
export function urlsOrdenadas(fotos: readonly { url: string; orden: number }[]): string[] {
  return [...fotos].sort((a, b) => a.orden - b.orden).map((foto) => foto.url);
}
