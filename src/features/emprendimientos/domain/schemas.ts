import { z } from "zod";
import { montoEnCentavos } from "@/shared/validaciones";

// Mismo formulario para crear y para editar
export const datosEmprendimientoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu emprendimiento")
    .max(60, "El nombre puede tener máximo 60 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(400, "La descripción puede tener máximo 400 caracteres")
    .transform((valor) => valor || null),
  zonas: z
    .array(
      z.object({
        zonaId: z.number().int().positive(),
        costoEnvio: montoEnCentavos("Escribe el costo de envío como 5 o 2.50"),
      }),
    )
    .min(1, "Elige al menos una zona que cubras")
    .transform((zonas) =>
      zonas.map((zona) => ({ zonaId: zona.zonaId, costoEnvioCentavos: zona.costoEnvio })),
    ),
});
