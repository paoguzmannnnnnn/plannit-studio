import type { FechaISO } from "@/shared/fechas";

export type EstadoDia = "pasado" | "disponible" | "bloqueado";

export function estadoDelDia(
  fecha: FechaISO,
  hoy: FechaISO,
  bloqueadas: ReadonlySet<FechaISO>,
): EstadoDia {
  if (fecha < hoy) return "pasado"; // las fechas ISO se comparan bien como texto
  return bloqueadas.has(fecha) ? "bloqueado" : "disponible";
}

export interface FechasBloqueadasRepository {
  listarEntre(emprendimientoId: string, desde: FechaISO, hasta: FechaISO): Promise<FechaISO[]>;
  bloquear(emprendimientoId: string, fecha: FechaISO): Promise<void>;
  desbloquear(emprendimientoId: string, fecha: FechaISO): Promise<void>;
}
