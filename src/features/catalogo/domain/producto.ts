import type { Database } from "@/shared/supabase/database.types";

export type TipoProducto = Database["public"]["Enums"]["tipo_producto"];

export const TIPOS_PRODUCTO = ["inmediato", "personalizable"] as const satisfies readonly TipoProducto[];

export const MAX_FOTOS_PRODUCTO = 5;

// Lo que depende del tipo. Cada estrategia llena lo suyo y deja lo demás en null/false.
export type CamposTipo = {
  stockPorFecha: number | null;
  cupoDiario: number | null;
  anticipacionHoras: number;
  permiteTexto: boolean;
  permiteReferencia: boolean;
};

export type DatosComunes = {
  nombre: string;
  descripcion: string | null;
  categoriaId: number;
  /** Con tamaños, es el precio del más barato (lo mantiene la base de datos) */
  precioCentavos: number;
};

// ---------- Opciones: valen para los dos tipos de producto ----------
export type Tamano = { id: string; nombre: string; detalle: string | null; precioCentavos: number };
export type Extra = { id: string; nombre: string; precioCentavos: number };

/** Al guardar: lo que ya existe trae id; lo nuevo, no */
export type TamanoEntrada = Omit<Tamano, "id"> & { id?: string };
export type ExtraEntrada = Omit<Extra, "id"> & { id?: string };

export type Opciones = {
  /** Cuántos colores de la paleta puede elegir el cliente (0 = no elige colores) */
  maxColores: number;
  tamanos: Tamano[];
  extras: Extra[];
};

export type OpcionesEntrada = { maxColores: number; tamanos: TamanoEntrada[]; extras: ExtraEntrada[] };

export type Foto = { id: string; url: string };

export type Producto = DatosComunes &
  CamposTipo &
  Opciones & {
    id: string;
    emprendimientoId: string;
    tipo: TipoProducto;
    activo: boolean;
    fotos: Foto[];
  };

export type CambiosProducto = DatosComunes & CamposTipo & OpcionesEntrada;

export type NuevoProducto = CambiosProducto & { tipo: TipoProducto; fotosUrls: string[] };

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
