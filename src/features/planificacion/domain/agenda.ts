import { z } from "zod";

// Un momento del día del evento que anota el cliente ("Llegan los invitados", 4:00 p. m.)
export type Momento = {
  id: string;
  /** "HH:MM", hora local del día del evento */
  hora: string;
  titulo: string;
  nota: string | null;
};

export type NuevoMomento = Omit<Momento, "id">;

// Lo que se muestra: los momentos del cliente + la entrega de la decoración (automática)
export type EntradaAgenda =
  | { tipo: "momento"; momento: Momento }
  | { tipo: "decoracion"; hora: string; emprendimientos: string[] };

export const MAX_MOMENTOS = 30;
export const MAX_NOTAS = 2000;

export const momentoSchema = z.object({
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elige la hora"),
  titulo: z
    .string()
    .trim()
    .min(1, "Escribe qué pasa a esa hora")
    .max(60, "Máximo 60 caracteres"),
  nota: z
    .string()
    .trim()
    .max(200, "La nota puede tener máximo 200 caracteres")
    .transform((valor) => valor || null),
});

export const notasSchema = z
  .string()
  .max(MAX_NOTAS, `Las notas pueden tener máximo ${MAX_NOTAS} caracteres`)
  .transform((valor) => valor.trim() || null);

/**
 * La decoración va a la hora de entrega del evento. Si coincide con un momento del cliente,
 * la decoración va primero (tiene que estar lista antes).
 */
export function armarAgenda(
  momentos: readonly Momento[],
  decoracion: { hora: string; emprendimientos: readonly string[] },
): EntradaAgenda[] {
  const entradas: EntradaAgenda[] = [
    { tipo: "decoracion", hora: decoracion.hora, emprendimientos: [...decoracion.emprendimientos] },
    ...momentos.map((momento) => ({ tipo: "momento" as const, momento })),
  ];
  const horaDe = (entrada: EntradaAgenda) => (entrada.tipo === "momento" ? entrada.momento.hora : entrada.hora);
  const peso = (entrada: EntradaAgenda) => (entrada.tipo === "decoracion" ? 0 : 1);
  // sort es estable: a la misma hora, los momentos quedan en el orden en que se agregaron
  return entradas.sort((a, b) => horaDe(a).localeCompare(horaDe(b)) || peso(a) - peso(b));
}

export interface AgendaRepository {
  listar(eventoId: string): Promise<Momento[]>;
  agregar(eventoId: string, momento: NuevoMomento): Promise<void>;
  quitar(eventoId: string, momentoId: string): Promise<void>;
  guardarNotas(eventoId: string, notas: string | null): Promise<void>;
}
