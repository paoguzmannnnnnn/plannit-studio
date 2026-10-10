import { z } from "zod";
import { entero } from "@/shared/validaciones";

export const MAX_FOTOS_RESENA = 3;

export type Resena = {
  id: string;
  pedidoId: string;
  emprendimientoId: string;
  estrellas: number;
  comentario: string | null;
  respuesta: string | null;
  creadaAt: string;
  autor: string;
  fotos: string[];
};

export const nuevaResenaSchema = z.object({
  estrellas: entero("Elige de 1 a 5 estrellas", 1, 5),
  comentario: z
    .string()
    .trim()
    .max(500, "El comentario puede tener máximo 500 caracteres")
    .transform((valor) => valor || null),
});

export type NuevaResena = z.infer<typeof nuevaResenaSchema>;

export const respuestaSchema = z
  .string()
  .trim()
  .min(2, "Escribe tu respuesta")
  .max(400, "La respuesta puede tener máximo 400 caracteres");

export const ETIQUETA_ESTRELLAS = ["Toca las estrellas", "Mala", "Regular", "Buena", "Muy buena", "¡Excelente!"] as const;

export interface ResenaRepository {
  crear(pedidoId: string, clienteId: string, emprendimientoId: string, datos: NuevaResena): Promise<string>;
  agregarFotos(resenaId: string, urls: string[]): Promise<void>;
  obtener(resenaId: string): Promise<Resena | null>;
  listarDeEmprendimiento(emprendimientoId: string, limite: number): Promise<Resena[]>;
  responder(resenaId: string, respuesta: string): Promise<void>;
}
