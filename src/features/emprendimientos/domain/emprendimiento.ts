import type { IdColor } from "@/features/colores/domain/colores";

export type ZonaCobertura = { zonaId: number; costoEnvioCentavos: number };

export type ZonaConCosto = { nombre: string; costoEnvioCentavos: number };

export type ZonaDeEntrega = ZonaCobertura & ZonaConCosto;

export type Emprendimiento = {
  id: string;
  nombre: string;
  descripcion: string | null;
  logoUrl: string | null;
  aprobado: boolean;
  ratingPromedio: number;
  totalResenas: number;
  zonas: ZonaDeEntrega[];
  paleta: IdColor[];
};

// Lo que el emprendedor llena al crear o editar
export type DatosEmprendimiento = {
  nombre: string;
  descripcion: string | null;
  logoUrl: string | null;
  zonas: ZonaCobertura[];
  paleta: IdColor[];
};

export type EstadoEmprendimiento = "en_revision" | "publicado";

export function estadoDe(emprendimiento: Pick<Emprendimiento, "aprobado">): EstadoEmprendimiento {
  return emprendimiento.aprobado ? "publicado" : "en_revision";
}

// Contrato del repositorio: el resto de la app depende de esto, no de Supabase
export interface EmprendimientoRepository {
  obtenerPorOwner(ownerId: string): Promise<Emprendimiento | null>;
  crear(datos: DatosEmprendimiento): Promise<string>;
  actualizar(datos: DatosEmprendimiento): Promise<void>;
  paletaDe(emprendimientoId: string): Promise<IdColor[]>;
}
