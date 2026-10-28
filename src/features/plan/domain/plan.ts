import type { ItemCarrito } from "@/features/carrito/domain/carrito";
import type { EstadoPedido } from "@/features/pedidos/domain/estados";
import { estadoVisible, type Pedido } from "@/features/pedidos/domain/pedido";
import { horasHasta } from "@/shared/fechas";
import { perteneceA, plantillaDe, SECCIONES, type IdSeccion } from "./secciones";

// ---------------------------------------------------------------------
// El plan del evento: lógica pura. Junta pedidos y carrito, los acomoda
// en los pasos del tipo de evento (en orden), calcula el progreso y,
// para lo que falta, hasta cuándo se puede elegir (según la anticipación real
// de los productos que hay para esa fecha y zona).
// ---------------------------------------------------------------------

export type EstadoElemento = "confirmado" | "por_pagar" | "esperando" | "sin_apartar";

export type ElementoPlan = {
  clave: string;
  productoId: string;
  nombre: string;
  fotoUrl: string | null;
  cantidad: number;
  estado: EstadoElemento;
  href: string;
};

export type Limite =
  | { tipo: "todas"; fecha: string } // antes de esta fecha se puede elegir entre todas las opciones
  | { tipo: "ultima"; fecha: string } // antes de esta fecha, ya no queda nada
  | { tipo: "mismo_dia" } // hay opciones listas hasta el día del evento
  | { tipo: "sin_opciones" };

export type LimiteConFecha = Extract<Limite, { fecha: string }>;

export type SeccionDelPlan = {
  id: IdSeccion;
  nombre: string;
  detalle: string;
  elementos: ElementoPlan[];
  /** El cliente lo resuelve por su cuenta ("Ya lo tengo"): cuenta como listo */
  cubierta: boolean;
  limite: Limite;
};

export type Plan = {
  secciones: SeccionDelPlan[];
  /** Lo elegido que no cae en ningún paso de este tipo de evento */
  extras: ElementoPlan[];
  listas: number;
  total: number;
  porcentaje: number;
  pendientes: SeccionDelPlan[];
  proxima: { seccion: SeccionDelPlan; limite: LimiteConFecha } | null;
  sinApartar: number;
};

export type ItemDePedido = {
  pedidoId: string;
  productoId: string;
  nombre: string;
  fotoUrl: string | null;
  cantidad: number;
};

export type InfoProducto = { categoria: string; anticipacionHoras: number };

export type EntradaPlan = {
  eventoId: string;
  tipoEvento: string;
  fechaEntrega: string;
  cubiertas: readonly string[];
  pedidos: readonly Pick<Pedido, "id" | "ordenId" | "estado" | "expiraAt">[];
  itemsPedido: readonly ItemDePedido[];
  itemsCarrito: readonly ItemCarrito[];
  /** Categoría y anticipación de cada producto involucrado */
  info: ReadonlyMap<string, InfoProducto>;
  /** Productos que hoy llegan a tiempo para el evento */
  disponibles: readonly string[];
};

// Los pedidos rechazados, expirados o cancelados no cuentan en el plan
const ESTADO_POR_PEDIDO: Partial<Record<EstadoPedido, EstadoElemento>> = {
  solicitado: "esperando",
  aceptado: "por_pagar",
  pagado: "confirmado",
  en_preparacion: "confirmado",
  entregado: "confirmado",
  completado: "confirmado",
};

const MS_POR_HORA = 60 * 60 * 1000;

function restarHoras(momento: string, horas: number): string {
  return new Date(new Date(momento).getTime() - horas * MS_POR_HORA).toISOString();
}

function elementosDePedidos(entrada: EntradaPlan): ElementoPlan[] {
  const pedidos = new Map(entrada.pedidos.map((pedido) => [pedido.id, pedido]));

  return entrada.itemsPedido.flatMap((item, indice) => {
    const pedido = pedidos.get(item.pedidoId);
    const estado = pedido ? ESTADO_POR_PEDIDO[estadoVisible(pedido)] : undefined;
    if (!pedido || !estado) return [];
    return [
      {
        clave: `pedido:${indice}`,
        productoId: item.productoId,
        nombre: item.nombre,
        fotoUrl: item.fotoUrl,
        cantidad: item.cantidad,
        estado,
        href: `/pedidos/${pedido.ordenId}`,
      },
    ];
  });
}

function elementosDelCarrito(entrada: EntradaPlan): ElementoPlan[] {
  return entrada.itemsCarrito.flatMap((item) =>
    item.producto
      ? [
          {
            clave: `carrito:${item.id}`,
            productoId: item.productoId,
            nombre: item.producto.nombre,
            fotoUrl: item.producto.fotoUrl,
            cantidad: item.cantidad,
            estado: "sin_apartar" as const,
            href: `/eventos/${entrada.eventoId}/carrito`,
          },
        ]
      : [],
  );
}

function limiteDe(seccion: IdSeccion, entrada: EntradaPlan): Limite {
  const anticipaciones = entrada.disponibles
    .map((id) => entrada.info.get(id))
    .filter((info): info is InfoProducto => perteneceA(seccion, info?.categoria))
    .map((info) => info.anticipacionHoras);

  if (anticipaciones.length === 0) return { tipo: "sin_opciones" };

  const mayor = Math.max(...anticipaciones);
  const menor = Math.min(...anticipaciones);
  if (mayor === 0) return { tipo: "mismo_dia" };

  const fecha = restarHoras(entrada.fechaEntrega, mayor);
  return mayor === menor ? { tipo: "ultima", fecha } : { tipo: "todas", fecha };
}

function tieneFecha(limite: Limite): limite is LimiteConFecha {
  return limite.tipo === "todas" || limite.tipo === "ultima";
}

export function armarPlan(entrada: EntradaPlan): Plan {
  const plantilla = plantillaDe(entrada.tipoEvento);
  const cubiertas = new Set(entrada.cubiertas);
  const elementos = [...elementosDePedidos(entrada), ...elementosDelCarrito(entrada)];
  const categoriaDe = (elemento: ElementoPlan) => entrada.info.get(elemento.productoId)?.categoria;

  const secciones: SeccionDelPlan[] = plantilla.map((id) => ({
    id,
    nombre: SECCIONES[id].nombre,
    detalle: SECCIONES[id].detalle,
    elementos: elementos.filter((elemento) => perteneceA(id, categoriaDe(elemento))),
    cubierta: cubiertas.has(id),
    limite: limiteDe(id, entrada),
  }));

  const extras = elementos.filter(
    (elemento) => !plantilla.some((id) => perteneceA(id, categoriaDe(elemento))),
  );

  const pendientes = secciones.filter((seccion) => !seccion.cubierta && seccion.elementos.length === 0);
  const listas = secciones.length - pendientes.length;

  const conFecha = pendientes.flatMap((seccion) =>
    tieneFecha(seccion.limite) ? [{ seccion, limite: seccion.limite }] : [],
  );
  const proxima = conFecha.sort((a, b) => a.limite.fecha.localeCompare(b.limite.fecha))[0] ?? null;

  return {
    secciones,
    extras,
    listas,
    total: secciones.length,
    porcentaje: secciones.length === 0 ? 100 : Math.round((listas / secciones.length) * 100),
    pendientes,
    proxima,
    sinApartar: entrada.itemsCarrito.reduce((total, item) => total + item.cantidad, 0),
  };
}

// Una fecha límite se marca urgente si quedan 3 días o menos
export function esUrgente(limite: LimiteConFecha, ahora: number = Date.now()): boolean {
  return horasHasta(limite.fecha, ahora) <= 72;
}

// "Backdrop, Globos y Letrero"
export function listaNatural(palabras: readonly string[]): string {
  if (palabras.length <= 1) return palabras.join("");
  return `${palabras.slice(0, -1).join(", ")} y ${palabras.at(-1)}`;
}
