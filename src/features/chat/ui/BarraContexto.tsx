import Link from "next/link";
import type { Rol } from "@/features/auth/domain/roles";
import { formatearDia } from "@/shared/fechas";
import { rutaDelPedido, type PedidoEnChat } from "../domain/chat";

type Props = {
  conversacionId: string;
  seleccionado: PedidoEnChat;
  pedidos: readonly PedidoEnChat[];
  rol: Rol;
};

// Barra fija arriba del chat: de qué pedido se está hablando, con acceso directo
export function BarraContexto({ conversacionId, seleccionado, pedidos, rol }: Props) {
  const otros = pedidos.filter((pedido) => pedido.id !== seleccionado.id);

  return (
    <div className="flex flex-col gap-1 bg-rosa px-4 py-2 text-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate">
          <span className="font-bold">{seleccionado.evento}</span> · {formatearDia(seleccionado.fechaEntrega)} ·{" "}
          {seleccionado.productos}
        </p>
        <Link href={rutaDelPedido(seleccionado, rol)} className="shrink-0 font-bold text-sandia">
          Ver ›
        </Link>
      </div>

      {otros.length > 0 && (
        <details>
          <summary className="cursor-pointer text-gris">
            {otros.length === 1 ? "Otro pedido con esta persona" : `${otros.length} pedidos más con esta persona`}
          </summary>
          <ul className="mt-1 flex flex-col gap-1">
            {otros.map((pedido) => (
              <li key={pedido.id}>
                <Link href={`/chat/${conversacionId}?pedido=${pedido.id}`} className="font-medium text-sandia">
                  {pedido.evento} · {formatearDia(pedido.fechaEntrega)} ›
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
