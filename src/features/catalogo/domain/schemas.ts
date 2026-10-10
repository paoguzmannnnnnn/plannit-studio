import { z } from "zod";
import { entero, montoEnCentavos } from "@/shared/validaciones";
import { TIPOS_PRODUCTO } from "./producto";

export const tipoProductoSchema = z.enum(TIPOS_PRODUCTO, {
  message: "Elige si el producto es inmediato o personalizable",
});

export const datosComunesSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe el nombre del producto")
    .max(80, "El nombre puede tener máximo 80 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(600, "La descripción puede tener máximo 600 caracteres")
    .transform((valor) => valor || null),
  categoriaId: entero("Elige una categoría", 1, 32767),
  precioCentavos: montoEnCentavos("Escribe el precio como 25 o 25.50").refine(
    (centavos) => centavos > 0,
    "El precio debe ser mayor a $0",
  ),
});
