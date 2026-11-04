import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import type { Evento } from "../domain/evento";
import { crearRepositorioEventos } from "../infrastructure/eventoRepository";

// El evento solo lo edita su dueño, y solo mientras no haya pasado
export async function cargarEventoEditable(eventoId: string) {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return null;

  const supabase = await createClient();
  const evento: Evento | null = await crearRepositorioEventos(supabase).obtener(eventoId);
  if (!evento || evento.clienteId !== usuario.id || horasHasta(evento.fechaEntrega) <= 0) return null;

  return { evento, supabase };
}
