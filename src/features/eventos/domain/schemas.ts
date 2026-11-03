import { z } from "zod";
import { esFechaISO, horasHasta, momentoLocal } from "@/shared/fechas";
import { normalizarPasos } from "@/features/plan/domain/secciones";
import { entero, montoEnCentavos } from "@/shared/validaciones";
import { TIPOS_EVENTO } from "./evento";

export const MESES_MAXIMOS_HACIA_ADELANTE = 12;
const HORAS_MAXIMAS = MESES_MAXIMOS_HACIA_ADELANTE * 31 * 24;

// Lo que siempre se puede cambiar
export const datosBasicosEventoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Ponle un nombre a tu evento")
    .max(60, "El nombre puede tener máximo 60 caracteres"),
  tipo: z.enum(TIPOS_EVENTO, { message: "Elige el tipo de evento" }),
  direccion: z
    .string()
    .trim()
    .min(5, "Escribe la dirección de entrega")
    .max(200, "La dirección puede tener máximo 200 caracteres"),
});

// Lo que define la disponibilidad: solo se cambia si no hay pedidos vivos
export const fechaYZonaSchema = z
  .object({
    fecha: z.string().refine(esFechaISO, "Elige la fecha de entrega"),
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elige la hora de entrega"),
    zonaId: entero("Elige la zona del evento", 1, 32767),
  })
  .transform(({ fecha, hora, zonaId }) => ({ zonaId, fechaEntrega: momentoLocal(fecha, hora) }))
  .refine((datos) => horasHasta(datos.fechaEntrega) > 0, {
    message: "La entrega tiene que ser en el futuro",
  })
  .refine((datos) => horasHasta(datos.fechaEntrega) <= HORAS_MAXIMAS, {
    message: `Por ahora puedes planear hasta ${MESES_MAXIMOS_HACIA_ADELANTE} meses adelante`,
  });

// Qué incluye el plan y cuánto se quiere gastar (el presupuesto es opcional)
export const planEventoSchema = z.object({
  pasos: z
    .array(z.string())
    .transform((valores) => normalizarPasos(valores))
    .refine((pasos) => pasos.length > 0, "Elige al menos una cosa para tu plan"),
  presupuestoCentavos: z.union([
    z.literal("").transform(() => null),
    montoEnCentavos("Escribe el presupuesto como 500 o 500.50").refine(
      (centavos) => centavos >= 100 && centavos <= 100_000_000,
      "El presupuesto va de $1 a $1,000,000",
    ),
  ]),
});
