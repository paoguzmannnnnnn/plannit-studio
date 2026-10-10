import Link from "next/link";
import type { Rol } from "@/features/auth/domain/roles";
import { formatearMomento } from "@/shared/fechas";
import type { AccionVista } from "../domain/acciones";
import { PRESENTACION_ESTADO } from "../domain/estados";
import { contraparte, totalDe, type Pedido } from "../domain/pedido";
import { AccionesPedido } from "./AccionesPedido";

type Props = { pedido: Pedido; rol: Rol; acciones: readonly AccionVista[]; href: string };

// Bloque destacado para un pedido que espera algo de este usuario, con la acción a la mano
export function AvisoPedido({ pedido, rol, acciones, href }: Props) {
  const presentacion = PRESENTACION_ESTADO[rol][pedido.estado];

  return (
    <article className="flex flex-col gap-3 rounded-card bg-rosa p-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-bold">
          {contraparte(pedido, rol)} · {presentacion.etiqueta}
        </p>
        <p className="text-xs">{presentacion.detalle}</p>
        {presentacion.plazo && pedido.expiraAt && (
          <p className="text-xs font-medium">
            {presentacion.plazo} {formatearMomento(pedido.expiraAt)}
          </p>
        )}
      </div>
      <AccionesPedido pedidoId={pedido.id} acciones={acciones} totalCentavos={totalDe(pedido)} />
      <Link href={href} className="self-start text-xs font-bold text-sandia">
        Ver detalle ›
      </Link>
    </article>
  );
}
