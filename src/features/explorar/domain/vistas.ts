import type { CamposTipo, TipoProducto } from "@/features/catalogo/domain/producto";
import type { ZonaConCosto } from "@/features/emprendimientos/domain/emprendimiento";

// Modelos de lectura para el lado público: solo lo que el cliente necesita ver

export type EmprendimientoBreve = {
  id: string;
  nombre: string;
  logoUrl: string | null;
  ratingPromedio: number;
  totalResenas: number;
};

export type TarjetaEmprendimiento = EmprendimientoBreve & {
  descripcion: string | null;
  fotos: string[]; // portadas de algunos de sus productos
};

export type EmprendimientoPublico = EmprendimientoBreve & {
  descripcion: string | null;
  zonas: ZonaConCosto[];
};

export type TarjetaProducto = CamposTipo & {
  id: string;
  nombre: string;
  tipo: TipoProducto;
  precioCentavos: number;
  portadaUrl: string | null;
  emprendimiento: EmprendimientoBreve;
};

export type ProductoPublico = TarjetaProducto & {
  descripcion: string | null;
  categoria: string;
  fotos: string[];
};

export type FiltroProductos = {
  categoriaId?: number;
  emprendimientoId?: string;
  limite?: number;
};

export interface ExplorarRepository {
  listarEmprendimientos(): Promise<TarjetaEmprendimiento[]>;
  listarProductos(filtro?: FiltroProductos): Promise<TarjetaProducto[]>;
  obtenerEmprendimiento(id: string): Promise<EmprendimientoPublico | null>;
  obtenerProducto(id: string): Promise<ProductoPublico | null>;
  hayEmprendimientosEnZona(zonaId: number): Promise<boolean>;
}
