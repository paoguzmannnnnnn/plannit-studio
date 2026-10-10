import type { Database } from "@/shared/supabase/database.types";

export type TipoProducto = Database["public"]["Enums"]["tipo_producto"];

export const TIPOS_PRODUCTO = ["inmediato", "personalizable"] as const satisfies readonly TipoProducto[];

export const MAX_FOTOS_PRODUCTO = 5;

// Lo que depende del tipo. Cada estrategia llena lo suyo y deja lo demás en null/false.
export type CamposTipo = {
  stockPorFecha: number | null;
  cupoDiario: number | null;
  anticipacionHoras: number;
  permiteColores: boolean;
  permiteTexto: boolean;
  permiteReferencia: boolean;
};

export type DatosComunes = {
  nombre: string;
  descripcion: string | null;
  categoriaId: number;
  precioCentavos: number;
};

export type Foto = { id: string; url: string };

export type Producto = DatosComunes &
  CamposTipo & {
    id: string;
    emprendimientoId: string;
    tipo: TipoProducto;
    activo: boolean;
    fotos: Foto[];
  };

export type NuevoProducto = DatosComunes & CamposTipo & { tipo: TipoProducto; fotosUrls: string[] };

export type CambiosProducto = DatosComunes & CamposTipo;

// Contrato del repositorio: la app depende de esto, no de Supabase
export interface ProductoRepository {
  listarPorEmprendimiento(emprendimientoId: string): Promise<Producto[]>;
  obtener(productoId: string): Promise<Producto | null>;
  crear(emprendimientoId: string, datos: NuevoProducto): Promise<string>;
  actualizar(productoId: string, cambios: CambiosProducto): Promise<void>;
  cambiarActivo(productoId: string, activo: boolean): Promise<void>;
  agregarFotos(productoId: string, urls: string[], ordenInicial: number): Promise<void>;
  eliminarFoto(fotoId: string): Promise<void>;
}
