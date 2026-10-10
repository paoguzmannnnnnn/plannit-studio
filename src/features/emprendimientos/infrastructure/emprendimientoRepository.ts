import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type {
  DatosEmprendimiento,
  Emprendimiento,
  EmprendimientoRepository,
} from "../domain/emprendimiento";

function aParametros(datos: DatosEmprendimiento) {
  return {
    p_nombre: datos.nombre,
    p_zonas: datos.zonas.map((zona) => ({
      zona_id: zona.zonaId,
      costo_envio_centavos: zona.costoEnvioCentavos,
    })),
    p_descripcion: datos.descripcion ?? undefined,
    p_logo_url: datos.logoUrl ?? undefined,
  };
}

export function crearRepositorioEmprendimientos(
  supabase: ClienteSupabase,
): EmprendimientoRepository {
  return {
    async obtenerPorOwner(ownerId: string): Promise<Emprendimiento | null> {
      const { data, error } = await supabase
        .from("emprendimientos")
        .select(
          "id, nombre, descripcion, logo_url, aprobado, rating_promedio, total_resenas, emprendimiento_zonas(costo_envio_centavos, zonas(id, nombre))",
        )
        .eq("owner_id", ownerId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        logoUrl: data.logo_url,
        aprobado: data.aprobado,
        ratingPromedio: Number(data.rating_promedio),
        totalResenas: data.total_resenas,
        zonas: [...data.emprendimiento_zonas]
          .sort((a, b) => a.zonas.id - b.zonas.id)
          .map((cobertura) => ({
            zonaId: cobertura.zonas.id,
            nombre: cobertura.zonas.nombre,
            costoEnvioCentavos: cobertura.costo_envio_centavos,
          })),
      };
    },

    // Emprendimiento + zonas en una sola transacción (función de Postgres)
    async crear(datos) {
      const { data, error } = await supabase.rpc("crear_emprendimiento", aParametros(datos));
      if (error) throw error;
      return data;
    },

    async actualizar(datos) {
      const { error } = await supabase.rpc("actualizar_emprendimiento", aParametros(datos));
      if (error) throw error;
    },
  };
}
