import type { Database } from "@/shared/supabase/database.types";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { CambiosProducto, Producto, ProductoRepository } from "../domain/producto";
import {
  aCamposTipo,
  aColumnasTipo,
  aExtras,
  aTamanos,
  SELECT_OPCIONES,
  type FilaExtra,
  type FilaTamano,
} from "./mapeos";

type Tablas = Database["public"]["Tables"];

type FilaProducto = Tablas["productos"]["Row"] & {
  producto_fotos: Pick<Tablas["producto_fotos"]["Row"], "id" | "url" | "orden">[];
  producto_tamanos: FilaTamano[];
  producto_extras: FilaExtra[];
};

const SELECT_PRODUCTO = `*, producto_fotos(id, url, orden), ${SELECT_OPCIONES}` as const;

// ---- Mappers: la BD habla snake_case, el dominio camelCase ----
function aProducto(fila: FilaProducto): Producto {
  return {
    id: fila.id,
    emprendimientoId: fila.emprendimiento_id,
    tipo: fila.tipo,
    activo: fila.activo,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    categoriaId: fila.categoria_id,
    precioCentavos: fila.precio_centavos,
    ...aCamposTipo(fila),
    maxColores: fila.max_colores,
    tamanos: aTamanos(fila.producto_tamanos),
    extras: aExtras(fila.producto_extras),
    fotos: [...fila.producto_fotos]
      .sort((a, b) => a.orden - b.orden)
      .map((foto) => ({ id: foto.id, url: foto.url })),
  };
}

function aColumnas(datos: CambiosProducto) {
  return {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    categoria_id: datos.categoriaId,
    precio_centavos: datos.precioCentavos,
    max_colores: datos.maxColores,
    ...aColumnasTipo(datos),
  };
}

export function crearRepositorioProductos(supabase: ClienteSupabase): ProductoRepository {
  async function agregarFotos(productoId: string, urls: string[], ordenInicial: number) {
    if (urls.length === 0) return;
    const { error } = await supabase.from("producto_fotos").insert(
      urls.map((url, indice) => ({ producto_id: productoId, url, orden: ordenInicial + indice })),
    );
    if (error) throw error;
  }

  // Tamaños y extras en una sola transacción; la BD también actualiza el precio "desde"
  async function guardarOpciones(productoId: string, datos: CambiosProducto) {
    const { error } = await supabase.rpc("guardar_opciones_producto", {
      p_producto_id: productoId,
      p_tamanos: datos.tamanos.map((tamano, orden) => ({
        id: tamano.id ?? null,
        nombre: tamano.nombre,
        detalle: tamano.detalle,
        precio_centavos: tamano.precioCentavos,
        orden,
      })),
      p_extras: datos.extras.map((extra, orden) => ({
        id: extra.id ?? null,
        nombre: extra.nombre,
        precio_centavos: extra.precioCentavos,
        orden,
      })),
    });
    if (error) throw error;
  }

  return {
    async listarPorEmprendimiento(emprendimientoId) {
      const { data, error } = await supabase
        .from("productos")
        .select(SELECT_PRODUCTO)
        .eq("emprendimiento_id", emprendimientoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(aProducto);
    },

    async obtener(productoId) {
      const { data, error } = await supabase
        .from("productos")
        .select(SELECT_PRODUCTO)
        .eq("id", productoId)
        .maybeSingle();

      if (error) throw error;
      return data ? aProducto(data) : null;
    },

    async crear(emprendimientoId, datos) {
      const { data, error } = await supabase
        .from("productos")
        .insert({ ...aColumnas(datos), emprendimiento_id: emprendimientoId, tipo: datos.tipo })
        .select("id")
        .single();

      if (error) throw error;
      await guardarOpciones(data.id, datos);
      await agregarFotos(data.id, datos.fotosUrls, 0);
      return data.id;
    },

    async actualizar(productoId, cambios) {
      const { error } = await supabase
        .from("productos")
        .update(aColumnas(cambios))
        .eq("id", productoId);
      if (error) throw error;
      await guardarOpciones(productoId, cambios);
    },

    async cambiarActivo(productoId, activo) {
      const { error } = await supabase.from("productos").update({ activo }).eq("id", productoId);
      if (error) throw error;
    },

    agregarFotos,

    async eliminarFoto(fotoId) {
      const { error } = await supabase.from("producto_fotos").delete().eq("id", fotoId);
      if (error) throw error;
    },
  };
}
