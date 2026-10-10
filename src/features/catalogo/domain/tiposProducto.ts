import { z } from "zod";
import { desdeZod, type Resultado } from "@/shared/resultado";
import { entero } from "@/shared/validaciones";
import type { CamposTipo, TipoProducto } from "./producto";

// ---------------------------------------------------------------------
// STRATEGY: cada tipo de producto define cómo se valida, qué guarda,
// cómo se describe y cómo se comporta al comprarlo. Agregar un tipo
// nuevo = agregar una estrategia, sin tocar formularios, acciones ni páginas.
// ---------------------------------------------------------------------
export interface EstrategiaTipoProducto {
  readonly etiqueta: string;
  readonly descripcion: string;
  /** El emprendedor debe aceptar el pedido antes de que el cliente pague */
  readonly requiereAceptacion: boolean;
  /** El cliente puede dejar colores, texto, notas o foto de referencia */
  readonly admitePersonalizacion: boolean;
  parsear(entrada: unknown): Resultado<CamposTipo>;
  /** Cómo lo ve el emprendedor en su panel */
  resumen(campos: CamposTipo): string;
  /** Cómo lo ve el cliente al explorar */
  resumenCliente(campos: CamposTipo): string;
  /** Cuánto queda para la fecha del evento del cliente */
  etiquetaDisponibilidad(disponibles: number): string;
}

const HORAS_POR_DIA = 24;

export function diasDeAnticipacion(campos: CamposTipo): number {
  return Math.round(campos.anticipacionHoras / HORAS_POR_DIA);
}

const plural = (cantidad: number, singular: string, varios: string) =>
  `${cantidad} ${cantidad === 1 ? singular : varios}`;

const casilla = z
  .literal("on")
  .optional()
  .transform((valor) => valor === "on");

const vacioComoCero = (valor: unknown) => (valor === "" || valor === undefined ? "0" : valor);

// ---------- Inmediato ----------
const inmediatoSchema = z
  .object({
    stock: entero("Las unidades por fecha van de 1 a 999", 1, 999),
    horas_preparacion: z.preprocess(
      vacioComoCero,
      entero("Las horas de preparación van de 0 a 72", 0, 72),
    ),
  })
  .transform(
    (datos): CamposTipo => ({
      stockPorFecha: datos.stock,
      cupoDiario: null,
      anticipacionHoras: datos.horas_preparacion,
      permiteColores: false,
      permiteTexto: false,
      permiteReferencia: false,
    }),
  );

const inmediato: EstrategiaTipoProducto = {
  etiqueta: "Inmediato",
  descripcion: "Ya está hecho. El cliente lo compra listo, sin esperar a que lo aceptes.",
  requiereAceptacion: false,
  admitePersonalizacion: false,
  parsear: (entrada) => desdeZod(inmediatoSchema.safeParse(entrada)),
  resumen(campos) {
    const preparacion =
      campos.anticipacionHoras > 0 ? `listo en ${campos.anticipacionHoras} h` : "entrega inmediata";
    return `${campos.stockPorFecha ?? 0} por fecha · ${preparacion}`;
  },
  resumenCliente(campos) {
    return campos.anticipacionHoras > 0
      ? `Listo en ${campos.anticipacionHoras} h`
      : "Listo para entregar";
  },
  etiquetaDisponibilidad: (disponibles) => plural(disponibles, "disponible", "disponibles"),
};

// ---------- Personalizable ----------
const personalizableSchema = z
  .object({
    dias_anticipacion: entero("Los días de anticipación van de 1 a 90", 1, 90),
    cupo: entero("Los pedidos por día van de 1 a 50", 1, 50),
    permite_colores: casilla,
    permite_texto: casilla,
    permite_referencia: casilla,
  })
  .transform(
    (datos): CamposTipo => ({
      stockPorFecha: null,
      cupoDiario: datos.cupo,
      anticipacionHoras: datos.dias_anticipacion * HORAS_POR_DIA,
      permiteColores: datos.permite_colores,
      permiteTexto: datos.permite_texto,
      permiteReferencia: datos.permite_referencia,
    }),
  );

const personalizable: EstrategiaTipoProducto = {
  etiqueta: "Personalizable",
  descripcion: "Se hace a la medida. Tú aceptas cada pedido antes de que el cliente pague.",
  requiereAceptacion: true,
  admitePersonalizacion: true,
  parsear: (entrada) => desdeZod(personalizableSchema.safeParse(entrada)),
  resumen(campos) {
    return `${plural(diasDeAnticipacion(campos), "día", "días")} de anticipación · ${campos.cupoDiario ?? 0} por día`;
  },
  resumenCliente(campos) {
    return `Pídelo con ${plural(diasDeAnticipacion(campos), "día", "días")} de anticipación`;
  },
  etiquetaDisponibilidad: (disponibles) =>
    `${plural(disponibles, "cupo", "cupos")} para tu fecha`,
};

// Record obliga a que cada tipo del enum tenga su estrategia
export const ESTRATEGIAS_TIPO: Record<TipoProducto, EstrategiaTipoProducto> = {
  inmediato,
  personalizable,
};
