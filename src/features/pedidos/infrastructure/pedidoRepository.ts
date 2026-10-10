import { personalizacionSchema } from "@/features/carrito/domain/carrito";
import { urlsOrdenadas } from "@/features/catalogo/infrastructure/mapeos";
import { aResena, COLUMNAS_RESENA, type FilaResena } from "@/features/resenas/infrastructure/resenaRepository";
import type { Database } from "@/shared/supabase/database.types";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { Pedido, PedidoRepository } from "../domain/pedido";

type Tablas = Database["public"]["Tables"];

type FilaPedido = Pick<
  Tablas["pedidos"]["Row"],
  | "id"
  | "orden_id"
  | "estado"
  | "subtotal_centavos"
  | "costo_envio_centavos"
  | "expira_at"
  | "motivo_rechazo"
  | "fecha_entrega"
> & {
  emprendimientos: Pick<Tablas["emprendimientos"]["Row"], "id" | "nombre">;
  pedido_items: (Pick<Tablas["pedido_items"]["Row"], "id" | "cantidad" | "precio_unitario_centavos" | "personalizacion"> & {
    productos:
      | (Pick<Tablas["productos"]["Row"], "nombre"> & {
          producto_fotos: Pick<Tablas["producto_fotos"]["Row"], "url" | "orden">[];
        })
      | null;
  })[];
  // Uno a uno (pedido_id es único); según la versión puede llegar como objeto o arreglo
  resenas: FilaResena | FilaResena[] | null;
  ordenes: {
    profiles: Pick<Tablas["profiles"]["Row"], "id" | "nombre">;
    eventos: Pick<Tablas["eventos"]["Row"], "id" | "nombre" | "direccion"> & {
      zonas: Pick<Tablas["zonas"]["Row"], "nombre">;
    };
  };
};

const SELECT_PEDIDO =
  `id, orden_id, estado, subtotal_centavos, costo_envio_centavos, expira_at, motivo_rechazo, fecha_entrega, emprendimientos(id, nombre), pedido_items(id, cantidad, precio_unitario_centavos, personalizacion, productos(nombre, producto_fotos(url, orden))), resenas(${COLUMNAS_RESENA}), ordenes!inner(id, evento_id, cliente_id, profiles(id, nombre), eventos(id, nombre, direccion, zonas(nombre)))` as const;

function primeraResena(valor: FilaPedido["resenas"]): FilaResena | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function resenaDe(fila: FilaPedido) {
  const resena = primeraResena(fila.resenas);
  return resena ? aResena(resena) : null;
}

function aPedido(fila: FilaPedido): Pedido {
  return {
    id: fila.id,
    ordenId: fila.orden_id,
    estado: fila.estado,
    subtotalCentavos: fila.subtotal_centavos,
    costoEnvioCentavos: fila.costo_envio_centavos,
    expiraAt: fila.expira_at,
    motivoRechazo: fila.motivo_rechazo,
    fechaEntrega: fila.fecha_entrega,
    emprendimiento: fila.emprendimientos,
    cliente: fila.ordenes.profiles,
    evento: {
      id: fila.ordenes.eventos.id,
      nombre: fila.ordenes.eventos.nombre,
      direccion: fila.ordenes.eventos.direccion,
      zona: fila.ordenes.eventos.zonas.nombre,
    },
    items: fila.pedido_items.map((item) => ({
      id: item.id,
      // Si el producto se pausó, el pedido conserva cantidad y precio
      nombre: item.productos?.nombre ?? "Producto",
      fotoUrl: item.productos ? (urlsOrdenadas(item.productos.producto_fotos)[0] ?? null) : null,
      cantidad: item.cantidad,
      precioUnitarioCentavos: item.precio_unitario_centavos,
      personalizacion: personalizacionSchema.safeParse(item.personalizacion).data ?? {},
    })),
    resena: resenaDe(fila),
  };
}

export function crearRepositorioPedidos(supabase: ClienteSupabase): PedidoRepository {
  const consulta = () => supabase.from("pedidos").select(SELECT_PEDIDO);

  async function listar(filtrar: (q: ReturnType<typeof consulta>) => ReturnType<typeof consulta>) {
    const { data, error } = await filtrar(consulta()).order("fecha_entrega");
    if (error) throw error;
    return data.map(aPedido);
  }

  return {
    listarDeCliente: (clienteId) => listar((q) => q.eq("ordenes.cliente_id", clienteId)),
    listarDeEmprendimiento: (emprendimientoId) => listar((q) => q.eq("emprendimiento_id", emprendimientoId)),
    listarDeEvento: (eventoId) => listar((q) => q.eq("ordenes.evento_id", eventoId)),
    listarDeOrden: (ordenId) => listar((q) => q.eq("orden_id", ordenId)),

    async obtener(pedidoId) {
      const { data, error } = await consulta().eq("id", pedidoId).maybeSingle();
      if (error) throw error;
      return data ? aPedido(data) : null;
    },

    async transiciones() {
      const { data, error } = await supabase.from("transiciones_pedido").select("desde, hacia, actor");
      if (error) throw error;
      return data;
    },

    // Postgres valida la transición, quién la hace y los plazos
    async cambiarEstado(pedidoId, estado, motivo) {
      const { error } = await supabase.rpc("cambiar_estado_pedido", {
        p_pedido_id: pedidoId,
        p_nuevo_estado: estado,
        p_motivo: motivo,
      });
      if (error) throw error;
    },
  };
}
