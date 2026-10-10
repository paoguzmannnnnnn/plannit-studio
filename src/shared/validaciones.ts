import { z } from "zod";
import { aCentavos } from "./dinero";

// "25" o "25.50" -> 2550
export function montoEnCentavos(mensaje: string) {
  return z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, mensaje)
    .transform(aCentavos);
}

// Entero positivo escrito en un input de texto, dentro de un rango
export function entero(mensaje: string, minimo: number, maximo: number) {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, mensaje)
    .transform(Number)
    .refine((numero) => numero >= minimo && numero <= maximo, mensaje);
}

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function esUuid(valor: string): boolean {
  return PATRON_UUID.test(valor);
}
