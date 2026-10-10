import Link from "next/link";
import type { Rol } from "@/features/auth/domain/roles";
import { EstadoPedidoBadge } from "@/features/pedidos/ui/EstadoPedidoBadge";
import { formatearCuando, formatearDia } from "@/shared/fechas";
import { contraparteDe, vistaPrevia, type ConversacionConContexto } from "../domain/chat";
import { FotoChat } from "./FotoChat";

type Props = { conversacion: ConversacionConContexto; rol: Rol; usuarioId: string };

export function FilaConversacion({ conversacion, rol, usuarioId }: Props) {
  const contraparte = contraparteDe(conversacion, rol);
  const { ultimo, noLeidos, principal, pedidos } = conversacion;
  const prefijo = ultimo?.autorId === usuarioId ? "Tú: " : "";
  const otros = pedidos.length - 1;

  return (
    <Link
      href={`/chat/${conversacion.id}`}
      className="flex items-start gap-3 rounded-card border border-borde bg-white p-3 transition hover:border-sandia"
    >
      <FotoChat nombre={contraparte.nombre} fotoUrl={principal?.fotoUrl ?? contraparte.logoUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-bold">{contraparte.nombre}</p>
          {ultimo && <span className="shrink-0 text-[11px] text-gris">{formatearCuando(ultimo.creadoAt)}</span>}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className={`truncate text-sm ${noLeidos > 0 ? "font-bold text-tinta" : "text-gris"}`}>
            {ultimo ? `${prefijo}${vistaPrevia(ultimo)}` : ""}
          </p>
          {noLeidos > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sandia px-1.5 text-[11px] font-bold text-white">
              {noLeidos}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {principal ? (
            <>
              <span className="truncate rounded-full border border-borde bg-fondo px-2 py-0.5 text-[11px]">
                {principal.evento} · {formatearDia(principal.fechaEntrega)}
              </span>
              <EstadoPedidoBadge estado={principal.estado} rol={rol} />
              {otros > 0 && <span className="text-[11px] text-gris">+{otros} más</span>}
            </>
          ) : (
            <span className="rounded-full border border-borde bg-fondo px-2 py-0.5 text-[11px] text-gris">
              Consulta · sin pedidos aún
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
