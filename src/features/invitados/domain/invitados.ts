import { z } from "zod";
import { entero } from "@/shared/validaciones";

export const ESTADOS_INVITADO = ["pendiente", "confirmado", "no_va"] as const;
export type EstadoInvitado = (typeof ESTADOS_INVITADO)[number];

export const ETIQUETA_ESTADO: Record<EstadoInvitado, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  no_va: "No va",
};

export type Invitado = {
  id: string;
  nombre: string;
  /** Cuántas personas son (la familia, la pareja…) */
  personas: number;
  estado: EstadoInvitado;
  nota: string | null;
};

export type NuevoInvitado = Omit<Invitado, "id" | "estado">;

export const MAX_INVITADOS = 300;
export const MAX_PERSONAS = 20;
export const PERSONAS_POR_MESA = 10;

export const invitadoSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre").max(60, "Máximo 60 caracteres"),
  personas: entero(`Las personas van de 1 a ${MAX_PERSONAS}`, 1, MAX_PERSONAS),
  nota: z
    .string()
    .trim()
    .max(120, "La nota puede tener máximo 120 caracteres")
    .transform((valor) => valor || null),
});

export const estadoInvitadoSchema = z.enum(ESTADOS_INVITADO);

export type ResumenInvitados = {
  invitaciones: number;
  /** Personas por estado */
  personas: Record<EstadoInvitado, number>;
  /** Los que podrían llegar: confirmados + pendientes */
  esperadas: number;
  mesas: number;
};

export function resumirInvitados(invitados: readonly Invitado[]): ResumenInvitados {
  const personas: Record<EstadoInvitado, number> = { pendiente: 0, confirmado: 0, no_va: 0 };
  for (const invitado of invitados) personas[invitado.estado] += invitado.personas;
  const esperadas = personas.confirmado + personas.pendiente;
  return { invitaciones: invitados.length, personas, esperadas, mesas: Math.ceil(esperadas / PERSONAS_POR_MESA) };
}

export interface InvitadoRepository {
  listar(eventoId: string): Promise<Invitado[]>;
  agregar(eventoId: string, invitado: NuevoInvitado): Promise<void>;
  cambiarEstado(eventoId: string, invitadoId: string, estado: EstadoInvitado): Promise<void>;
  quitar(eventoId: string, invitadoId: string): Promise<void>;
}
