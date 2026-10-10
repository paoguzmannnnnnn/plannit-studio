import { z } from "zod";
import { esFechaISO, horasHasta, momentoLocal } from "@/shared/fechas";
import { entero } from "@/shared/validaciones";
import { TIPOS_EVENTO } from "./evento";

export const MESES_MAXIMOS_HACIA_ADELANTE = 12;
const HORAS_MAXIMAS = MESES_MAXIMOS_HACIA_ADELANTE * 31 * 24;

export const nuevoEventoSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "Ponle un nombre a tu evento")
      .max(60, "El nombre puede tener máximo 60 caracteres"),
    tipo: z.enum(TIPOS_EVENTO, { message: "Elige el tipo de evento" }),
    fecha: z.string().refine(esFechaISO, "Elige la fecha de entrega"),
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elige la hora de entrega"),
    zonaId: entero("Elige la zona del evento", 1, 32767),
    direccion: z
      .string()
      .trim()
      .min(5, "Escribe la dirección de entrega")
      .max(200, "La dirección puede tener máximo 200 caracteres"),
  })
  .transform(({ fecha, hora, ...resto }) => ({
    ...resto,
    fechaEntrega: momentoLocal(fecha, hora),
  }))
  .refine((datos) => horasHasta(datos.fechaEntrega) > 0, {
    message: "La entrega tiene que ser en el futuro",
  })
  .refine((datos) => horasHasta(datos.fechaEntrega) <= HORAS_MAXIMAS, {
    message: `Por ahora puedes planear hasta ${MESES_MAXIMOS_HACIA_ADELANTE} meses adelante`,
  });
