import { z } from "zod";
import type { TipoProducto } from "@/features/catalogo/domain/producto";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";

// ---------- Personalización que el cliente deja en un producto ----------
export const personalizacionSchema = z.object({
  colores: z.string().trim().max(80, "Los colores pueden tener máximo 80 caracteres").optional(),
  texto: z.string().trim().max(80, "El texto puede tener máximo 80 caracteres").optional(),
  notas: z.string().trim().max(400, "Las notas pueden tener máximo 400 caracteres").optional(),
  referenciaUrl: z.string().url().optional(),
});

export type Personalizacion = z.infer<typeof personalizacionSchema>;

export function esPersonalizacionVacia(personalizacion: Personalizacion): boolean {
  return !personalizacion.colores && !personalizacion.texto && !personalizacion.notas && !personalizacion.referenciaUrl;
}

export function describirPersonalizacion(personalizacion: Personalizacion): string[] {
  return [
    personalizacion.colores && `Colores: ${personalizacion.colores}`,
    personalizacion.texto && `Texto: ${personalizacion.texto}`,
    personalizacion.notas && `Notas: ${personalizacion.notas}`,
    personalizacion.referenciaUrl && "Con foto de referencia",
  ].filter((linea): linea is string => Boolean(linea));
}

// ---------- Carrito ----------
export type ProductoEnCarrito = {
  nombre: string;
  tipo: TipoProducto;
  precioCentavos: number;
  fotoUrl: string | null;
  emprendimiento: { id: string; nombre: string };
};

export type ItemCarrito = {
  id: string;
  productoId: string;
  cantidad: number;
  personalizacion: Personalizacion;
  /** null si el producto se pausó o dejó de ser visible */
  producto: ProductoEnCarrito | null;
};

export type Disponibilidad = { disponibles: number; costoEnvioCentavos: number };

export type EstadoLinea = "ok" | "no_disponible" | "excede";

export type LineaCarrito = ItemCarrito & {
  producto: ProductoEnCarrito;
  estado: EstadoLinea;
  disponibles: number;
  totalCentavos: number;
};

export type GrupoCarrito = {
  emprendimiento: { id: string; nombre: string };
  lineas: LineaCarrito[];
  subtotalCentavos: number;
  envioCentavos: number;
  /** Ya hay un pedido vivo con este emprendimiento para el evento: el envío no se cobra otra vez */
  envioCubierto: boolean;
  requiereAceptacion: boolean;
};

export type Carrito = {
  grupos: GrupoCarrito[];
  sinProducto: ItemCarrito[];
  subtotalCentavos: number;
  envioCentavos: number;
  totalCentavos: number;
  cantidadProductos: number;
  puedeConfirmar: boolean;
};

const sumar = (valores: readonly number[]) => valores.reduce((total, valor) => total + valor, 0);

export function subtotalDeItems(items: readonly ItemCarrito[]): number {
  return sumar(items.map((item) => (item.producto?.precioCentavos ?? 0) * item.cantidad));
}

export function cantidadEnCarrito(items: readonly ItemCarrito[], productoId: string): number {
  return sumar(items.filter((item) => item.productoId === productoId).map((item) => item.cantidad));
}

// Un producto sin personalización se suma al renglón que ya existe; con personalización va aparte
export function itemParaSumar(
  items: readonly ItemCarrito[],
  productoId: string,
  personalizacion: Personalizacion,
): ItemCarrito | undefined {
  if (!esPersonalizacionVacia(personalizacion)) return undefined;
  return items.find(
    (item) => item.productoId === productoId && esPersonalizacionVacia(item.personalizacion),
  );
}

function tieneProducto(item: ItemCarrito): item is ItemCarrito & { producto: ProductoEnCarrito } {
  return item.producto !== null;
}

// Lógica pura: arma grupos por emprendimiento, totales y qué impide confirmar.
// envioCubierto: emprendimientos que ya llevan algo a este evento (no se cobra envío otra vez).
export function armarCarrito(
  items: readonly ItemCarrito[],
  disponibilidad: ReadonlyMap<string, Disponibilidad>,
  envioCubierto: ReadonlySet<string> = new Set(),
): Carrito {
  const sinProducto = items.filter((item) => !tieneProducto(item));

  const lineas: LineaCarrito[] = items.filter(tieneProducto).map((item) => {
    const disponible = disponibilidad.get(item.productoId);
    const estado: EstadoLinea = !disponible
      ? "no_disponible"
      : cantidadEnCarrito(items, item.productoId) > disponible.disponibles
        ? "excede"
        : "ok";

    return {
      ...item,
      estado,
      disponibles: disponible?.disponibles ?? 0,
      totalCentavos: item.producto.precioCentavos * item.cantidad,
    };
  });

  const porEmprendimiento = new Map<string, LineaCarrito[]>();
  for (const linea of lineas) {
    const id = linea.producto.emprendimiento.id;
    porEmprendimiento.set(id, [...(porEmprendimiento.get(id) ?? []), linea]);
  }

  const grupos: GrupoCarrito[] = [...porEmprendimiento.values()].map((lineasGrupo) => {
    const emprendimiento = lineasGrupo[0].producto.emprendimiento;
    const cubierto = envioCubierto.has(emprendimiento.id);
    return {
    emprendimiento,
    lineas: lineasGrupo,
    subtotalCentavos: sumar(lineasGrupo.map((linea) => linea.totalCentavos)),
    // El envío se cobra una vez por emprendimiento y por evento
    envioCubierto: cubierto,
    envioCentavos: cubierto
      ? 0
      : (lineasGrupo
          .map((linea) => disponibilidad.get(linea.productoId)?.costoEnvioCentavos)
          .find((costo) => costo !== undefined) ?? 0),
    requiereAceptacion: lineasGrupo.some(
      (linea) => ESTRATEGIAS_TIPO[linea.producto.tipo].requiereAceptacion,
    ),
    };
  });

  const subtotalCentavos = sumar(grupos.map((grupo) => grupo.subtotalCentavos));
  const envioCentavos = sumar(grupos.map((grupo) => grupo.envioCentavos));

  return {
    grupos,
    sinProducto,
    subtotalCentavos,
    envioCentavos,
    totalCentavos: subtotalCentavos + envioCentavos,
    cantidadProductos: sumar(items.map((item) => item.cantidad)),
    puedeConfirmar:
      items.length > 0 && sinProducto.length === 0 && lineas.every((linea) => linea.estado === "ok"),
  };
}

export interface CarritoRepository {
  listarItems(eventoId: string): Promise<ItemCarrito[]>;
  disponibilidad(eventoId: string): Promise<Map<string, Disponibilidad>>;
  agregar(eventoId: string, productoId: string, cantidad: number, personalizacion: Personalizacion): Promise<void>;
  cambiarCantidad(eventoId: string, itemId: string, cantidad: number): Promise<void>;
  quitar(eventoId: string, itemId: string): Promise<void>;
  confirmar(eventoId: string): Promise<string>;
}
