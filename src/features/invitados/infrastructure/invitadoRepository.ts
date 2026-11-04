import type { ClienteSupabase } from "@/shared/supabase/tipos";
import { estadoInvitadoSchema, type InvitadoRepository } from "../domain/invitados";

export function crearRepositorioInvitados(supabase: ClienteSupabase): InvitadoRepository {
  return {
    async listar(eventoId) {
      const { data, error } = await supabase
        .from("evento_invitados")
        .select("id, nombre, personas, estado, nota")
        .eq("evento_id", eventoId)
        .order("created_at");

      if (error) throw error;
      return data.map((fila) => ({
        id: fila.id,
        nombre: fila.nombre,
        personas: fila.personas,
        // La columna es texto con check: aquí se asegura el tipo
        estado: estadoInvitadoSchema.catch("pendiente").parse(fila.estado),
        nota: fila.nota,
      }));
    },

    async agregar(eventoId, invitado) {
      const { error } = await supabase.from("evento_invitados").insert({ evento_id: eventoId, ...invitado });
      if (error) throw error;
    },

    async cambiarEstado(eventoId, invitadoId, estado) {
      const { error } = await supabase
        .from("evento_invitados")
        .update({ estado })
        .eq("id", invitadoId)
        .eq("evento_id", eventoId);
      if (error) throw error;
    },

    async quitar(eventoId, invitadoId) {
      const { error } = await supabase.from("evento_invitados").delete().eq("id", invitadoId).eq("evento_id", eventoId);
      if (error) throw error;
    },
  };
}
