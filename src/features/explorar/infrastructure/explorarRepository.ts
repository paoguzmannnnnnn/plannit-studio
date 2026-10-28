import { aCamposTipo, COLUMNAS_TIPO, urlsOrdenadas } from "@/features/catalogo/infrastructure/mapeos";
import type { Database } from "@/shared/supabase/database.types";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type {
  EmprendimientoBreve,
  ExplorarRepository,
  TarjetaProducto,
} from "../domain/vistas";

type Tablas = Database["public"]["Tables"];
type FilaEmprendimiento = Tablas["emprendimientos"]["Row"];

type FilaEmprendimientoBreve = Pick<
  FilaEmprendimiento,
  "id" | "nombre" | "logo_url" | "rating_promedio" | "total_resenas"
>;

type FilaTarjetaProducto = Pick<
  Tablas["productos"]["Row"],
  | "id"
  | "nombre"
  | "tipo"
  | "precio_centavos"
  | "stock_por_fecha"
  | "cupo_diario"
  | "anticipacion_horas"
  | "permite_colores"
  | "permite_texto"
  | "permite_referencia"
> & {
  producto_fotos: Pick<Tablas["producto_fotos"]["Row"], "url" | "orden">[];
  emprendimientos: FilaEmprendimientoBreve;
};

const COLUMNAS_EMPRENDIMIENTO_BREVE = "id, nombre, logo_url, rating_promedio, total_resenas" as const;

// "as const" mantiene el texto exacto para que Supabase infiera los tipos.
// !inner + filtro aprobado: nunca se muestran productos de emprendimientos sin aprobar
const SELECT_TARJETA_PRODUCTO = `id, nombre, tipo, precio_centavos, ${COLUMNAS_TIPO}, producto_fotos(url, orden), emprendimientos!inner(${COLUMNAS_EMPRENDIMIENTO_BREVE}, aprobado)` as const;

function aEmprendimientoBreve(fila: FilaEmprendimientoBreve): EmprendimientoBreve {
  return {
    id: fila.id,
    nombre: fila.nombre,
    logoUrl: fila.logo_url,
    ratingPromedio: Number(fila.rating_promedio),
    totalResenas: fila.total_resenas,
  };
}

function aTarjetaProducto(fila: FilaTarjetaProducto): TarjetaProducto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    tipo: fila.tipo,
    precioCentavos: fila.precio_centavos,
    ...aCamposTipo(fila),
    portadaUrl: urlsOrdenadas(fila.producto_fotos)[0] ?? null,
    emprendimiento: aEmprendimientoBreve(fila.emprendimientos),
  };
}

const FOTOS_POR_TARJETA = 3;

export function crearRepositorioExplorar(supabase: ClienteSupabase): ExplorarRepository {
  return {
    async listarEmprendimientos() {
      const { data, error } = await supabase
        .from("emprendimientos")
        .select(
          `${COLUMNAS_EMPRENDIMIENTO_BREVE}, descripcion, productos(activo, producto_fotos(url, orden))` as const,
        )
        .eq("aprobado", true)
        .order("rating_promedio", { ascending: false });

      if (error) throw error;

      return data
        .map((fila) => ({
          ...aEmprendimientoBreve(fila),
          descripcion: fila.descripcion,
          fotos: fila.productos
            .filter((producto) => producto.activo)
            .map((producto) => urlsOrdenadas(producto.producto_fotos)[0])
            .filter((url): url is string => Boolean(url))
            .slice(0, FOTOS_POR_TARJETA),
        }))
        .filter((emprendimiento) => emprendimiento.fotos.length > 0); // vitrinas vacías no se muestran
    },

    async listarProductos({ categoriaId, emprendimientoId, limite = 48 } = {}) {
      let consulta = supabase
        .from("productos")
        .select(SELECT_TARJETA_PRODUCTO)
        .eq("activo", true)
        .eq("emprendimientos.aprobado", true);

      if (categoriaId) consulta = consulta.eq("categoria_id", categoriaId);
      if (emprendimientoId) consulta = consulta.eq("emprendimiento_id", emprendimientoId);

      const { data, error } = await consulta
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data.map(aTarjetaProducto);
    },

    async obtenerEmprendimiento(id) {
      const { data, error } = await supabase
        .from("emprendimientos")
        .select(
          `${COLUMNAS_EMPRENDIMIENTO_BREVE}, descripcion, emprendimiento_zonas(costo_envio_centavos, zonas(id, nombre))` as const,
        )
        .eq("id", id)
        .eq("aprobado", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...aEmprendimientoBreve(data),
        descripcion: data.descripcion,
        zonas: [...data.emprendimiento_zonas]
          .sort((a, b) => a.zonas.id - b.zonas.id)
          .map((cobertura) => ({
            nombre: cobertura.zonas.nombre,
            costoEnvioCentavos: cobertura.costo_envio_centavos,
          })),
      };
    },

    async obtenerProducto(id) {
      const { data, error } = await supabase
        .from("productos")
        .select(`${SELECT_TARJETA_PRODUCTO}, descripcion, categorias(nombre)` as const)
        .eq("id", id)
        .eq("activo", true)
        .eq("emprendimientos.aprobado", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...aTarjetaProducto(data),
        descripcion: data.descripcion,
        categoria: data.categorias.nombre,
        fotos: urlsOrdenadas(data.producto_fotos),
      };
    },

    async hayEmprendimientosEnZona(zonaId) {
      const { count, error } = await supabase
        .from("emprendimiento_zonas")
        .select("emprendimiento_id, emprendimientos!inner(aprobado)", { count: "exact", head: true })
        .eq("zona_id", zonaId)
        .eq("emprendimientos.aprobado", true);

      if (error) throw error;
      return (count ?? 0) > 0;
    },

    // Totales calculados en Postgres: no expone pedidos ni reseñas de nadie
    async estadisticasProductos() {
      const { data, error } = await supabase.rpc("estadisticas_productos");
      if (error) throw error;

      return new Map(
        data.map((fila) => [
          fila.producto_id,
          {
            vecesElegido: fila.veces_elegido,
            ratingPromedio: Number(fila.rating_promedio ?? 0),
            totalResenas: fila.total_resenas,
          },
        ]),
      );
    },
  };
}
