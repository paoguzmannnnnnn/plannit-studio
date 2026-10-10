import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { FechasBloqueadasRepository } from "../domain/fechasBloqueadas";

export function crearRepositorioFechasBloqueadas(
  supabase: ClienteSupabase,
): FechasBloqueadasRepository {
  return {
    async listarEntre(emprendimientoId, desde, hasta) {
      const { data, error } = await supabase
        .from("fechas_bloqueadas")
        .select("fecha")
        .eq("emprendimiento_id", emprendimientoId)
        .gte("fecha", desde)
        .lte("fecha", hasta);

      if (error) throw error;
      return data.map((fila) => fila.fecha);
    },

    async bloquear(emprendimientoId, fecha) {
      // Si ya estaba bloqueado no hace nada (evita error por doble clic)
      const { error } = await supabase
        .from("fechas_bloqueadas")
        .upsert(
          { emprendimiento_id: emprendimientoId, fecha },
          { onConflict: "emprendimiento_id,fecha", ignoreDuplicates: true },
        );
      if (error) throw error;
    },

    async desbloquear(emprendimientoId, fecha) {
      const { error } = await supabase
        .from("fechas_bloqueadas")
        .delete()
        .eq("emprendimiento_id", emprendimientoId)
        .eq("fecha", fecha);
      if (error) throw error;
    },
  };
}
