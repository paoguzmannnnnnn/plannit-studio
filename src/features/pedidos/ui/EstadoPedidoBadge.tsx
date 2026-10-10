import type { Rol } from "@/features/auth/domain/roles";
import { CLASE_TONO, PRESENTACION_ESTADO, type EstadoPedido } from "../domain/estados";

export function EstadoPedidoBadge({ estado, rol }: { estado: EstadoPedido; rol: Rol }) {
  const { etiqueta, tono } = PRESENTACION_ESTADO[rol][estado];
  return (
    <span className={`shrink-0 -rotate-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${CLASE_TONO[tono]}`}>
      {etiqueta}
    </span>
  );
}
