import type { TipoProducto } from "@/features/catalogo/domain/producto";
import type { EmprendimientoBreve } from "@/features/explorar/domain/vistas";

export const TIPOS_EVENTO = [
  "Cumpleaños",
  "Baby shower",
  "Boda",
  "Graduación",
  "Bautizo o primera comunión",
  "Fiesta privada",
  "Evento corporativo",
  "Otro",
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number];

export type Evento = {
  id: string;
  clienteId: string;
  nombre: string;
  tipo: string;
  fechaEntrega: string; // timestamptz: fecha + hora en que la decoración debe estar lista
  zona: { id: number; nombre: string };
  direccion: string;
};

// Lo que se guarda al crear o editar un evento
export type DatosEvento = {
  nombre: string;
  tipo: TipoEvento;
  fechaEntrega: string;
  zonaId: number;
  direccion: string;
};

// Lo que devuelve la función productos_disponibles para un evento
export type ProductoDisponible = {
  id: string;
  nombre: string;
  tipo: TipoProducto;
  precioCentavos: number;
  fotoUrl: string | null;
  disponibles: number;
  costoEnvioCentavos: number;
  emprendimiento: Omit<EmprendimientoBreve, "logoUrl">;
};

export function separarPorFecha(eventos: readonly Evento[], ahora: number = Date.now()) {
  const esProximo = (evento: Evento) => new Date(evento.fechaEntrega).getTime() >= ahora;
  return {
    proximos: eventos.filter(esProximo),
    pasados: eventos.filter((evento) => !esProximo(evento)).reverse(),
  };
}

export interface EventoRepository {
  listarDe(clienteId: string): Promise<Evento[]>;
  obtener(eventoId: string): Promise<Evento | null>;
  crear(clienteId: string, datos: DatosEvento): Promise<string>;
  actualizar(eventoId: string, datos: DatosEvento): Promise<void>;
  productosDisponibles(eventoId: string, tipo: TipoProducto): Promise<ProductoDisponible[]>;
}
