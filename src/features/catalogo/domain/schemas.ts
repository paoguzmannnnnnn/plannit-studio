import { z } from "zod";
import { MAX_COLORES_PRODUCTO } from "@/features/colores/domain/colores";
import { entero, montoEnCentavos } from "@/shared/validaciones";
import { MAX_EXTRAS, MAX_TAMANOS } from "./opciones";
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
});

// Solo se pide si el producto no tiene tamaños
export const precioSchema = montoEnCentavos("Escribe el precio como 25 o 25.50").refine(
  (centavos) => centavos > 0,
  "El precio debe ser mayor a $0",
);

const idOpcional = z.string().uuid().optional();

const tamanoSchema = z
  .object({
    id: idOpcional,
    nombre: z.string().trim().min(1, "Ponle nombre a cada tamaño").max(30, "El nombre del tamaño es muy largo"),
    detalle: z.string().trim().max(40, "El detalle del tamaño es muy largo").default(""),
    precio: precioSchema,
  })
  .transform(({ id, nombre, detalle, precio }) => ({ id, nombre, detalle: detalle || null, precioCentavos: precio }));

const extraSchema = z
  .object({
    id: idOpcional,
    nombre: z.string().trim().min(1, "Ponle nombre a cada extra").max(40, "El nombre del extra es muy largo"),
    precio: precioSchema,
  })
  .transform(({ id, nombre, precio }) => ({ id, nombre, precioCentavos: precio }));

export const opcionesSchema = z.object({
  maxColores: entero("Elige cuántos colores puede escoger el cliente", 0, MAX_COLORES_PRODUCTO),
  tamanos: z.array(tamanoSchema).max(MAX_TAMANOS, `Puedes tener máximo ${MAX_TAMANOS} tamaños`),
  extras: z.array(extraSchema).max(MAX_EXTRAS, `Puedes tener máximo ${MAX_EXTRAS} extras`),
});
