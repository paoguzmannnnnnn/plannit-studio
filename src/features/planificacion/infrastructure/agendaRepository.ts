import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { AgendaRepository } from "../domain/agenda";

export function crearRepositorioAgenda(supabase: ClienteSupabase): AgendaRepository {
  return {
    async listar(eventoId) {
      const { data, error } = await supabase
        .from("evento_agenda")
        .select("id, hora, titulo, nota")
        .eq("evento_id", eventoId)
        .order("hora")
        .order("created_at");

      if (error) throw error;
      // Postgres devuelve "16:00:00": nos quedamos con "16:00"
      return data.map((fila) => ({ id: fila.id, hora: fila.hora.slice(0, 5), titulo: fila.titulo, nota: fila.nota }));
    },

    async agregar(eventoId, momento) {
      const { error } = await supabase.from("evento_agenda").insert({ evento_id: eventoId, ...momento });
      if (error) throw error;
    },

    async quitar(eventoId, momentoId) {
      const { error } = await supabase.from("evento_agenda").delete().eq("id", momentoId).eq("evento_id", eventoId);
      if (error) throw error;
    },

    async guardarNotas(eventoId, notas) {
      const { error } = await supabase.from("eventos").update({ notas }).eq("id", eventoId);
      if (error) throw error;
    },
  };
}
