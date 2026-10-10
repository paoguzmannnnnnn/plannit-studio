import type { Rol } from "@/features/auth/domain/roles";
import { escribirSobrePedido } from "@/features/chat/application/actions";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { crearResena } from "@/features/resenas/application/actions";
import { ResenaForm } from "@/features/resenas/ui/ResenaForm";
import { TarjetaResena } from "@/features/resenas/ui/TarjetaResena";
import { formatearMomento } from "@/shared/fechas";
import type { AccionVista } from "../domain/acciones";
import { PRESENTACION_ESTADO } from "../domain/estados";
import { contraparte, estadoVisible, puedeResenarse, totalDe, type Pedido } from "../domain/pedido";
import { AccionesPedido } from "./AccionesPedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import { ItemsPedido } from "./ItemsPedido";

type Props = { pedido: Pedido; rol: Rol; acciones: readonly AccionVista[] };

export function TarjetaPedido({ pedido, rol, acciones }: Props) {
  const estado = estadoVisible(pedido);
  const presentacion = PRESENTACION_ESTADO[rol][estado];
  const plazo =
    presentacion.plazo && pedido.expiraAt
      ? `${presentacion.plazo} ${formatearMomento(pedido.expiraAt)}`
      : null;

  return (
    <article className="flex flex-col gap-4 rounded-card border border-borde bg-white p-4">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="truncate font-bold">{contraparte(pedido, rol)}</h2>
          <EstadoPedidoBadge estado={estado} rol={rol} />
        </div>
        <p className="text-xs text-gris">{presentacion.detalle}</p>
        {plazo && estado !== "expirado" && <p className="text-xs font-medium">{plazo}</p>}
        {estado === "rechazado" && pedido.motivoRechazo && (
          <p className="mt-1 rounded-2xl bg-rosa px-3 py-2 text-xs">Motivo: {pedido.motivoRechazo}</p>
        )}
      </header>

      <ItemsPedido pedido={pedido} />
      <AccionesPedido pedidoId={pedido.id} acciones={acciones} totalCentavos={totalDe(pedido)} />

      <form action={escribirSobrePedido.bind(null, pedido.id)}>
        <BotonFormulario className="text-sm font-bold text-sandia transition hover:brightness-90">
          Escribir a {contraparte(pedido, rol)} ›
        </BotonFormulario>
      </form>

      {rol === "cliente" && puedeResenarse(pedido) && (
        <ResenaForm accion={crearResena.bind(null, pedido.id)} emprendimiento={pedido.emprendimiento.nombre} />
      )}
      {pedido.resena && (
        <TarjetaResena
          resena={pedido.resena}
          emprendimiento={pedido.emprendimiento.nombre}
          puedeResponder={rol === "emprendedor"}
        />
      )}
    </article>
  );
}
