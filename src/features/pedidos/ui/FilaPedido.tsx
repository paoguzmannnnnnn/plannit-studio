import Link from "next/link";
import type { Rol } from "@/features/auth/domain/roles";
import { formatearDolares } from "@/shared/dinero";
import { formatearDia } from "@/shared/fechas";
import { contraparte, estadoVisible, puedeResenarse, totalDe, type Pedido } from "../domain/pedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";

type Props = { pedido: Pedido; rol: Rol; href: string; mostrarEvento?: boolean };

export function FilaPedido({ pedido, rol, href, mostrarEvento = true }: Props) {
  const detalle = mostrarEvento
    ? `${pedido.evento.nombre} · ${formatearDia(pedido.fechaEntrega)} · ${pedido.evento.zona}`
    : pedido.items.map((item) => item.nombre).join(" · ");

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-card border border-borde bg-white p-4 transition hover:border-sandia"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold">{contraparte(pedido, rol)}</p>
          <EstadoPedidoBadge estado={estadoVisible(pedido)} rol={rol} />
        </div>
        <p className="truncate text-xs text-gris">{detalle}</p>
        {rol === "cliente" && puedeResenarse(pedido) && (
          <p className="text-xs font-bold text-sandia">Deja tu reseña ›</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-bold">{formatearDolares(totalDe(pedido))}</span>
    </Link>
  );
}
