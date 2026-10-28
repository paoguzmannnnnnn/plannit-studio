import type { Rol } from "@/features/auth/domain/roles";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import { PRESENTACION_ESTADO, TONO_ETIQUETA, type EstadoPedido } from "../domain/estados";

export function EstadoPedidoBadge({ estado, rol }: { estado: EstadoPedido; rol: Rol }) {
  const { etiqueta, tono } = PRESENTACION_ESTADO[rol][estado];
  return <Etiqueta tono={TONO_ETIQUETA[tono]}>{etiqueta}</Etiqueta>;
}
