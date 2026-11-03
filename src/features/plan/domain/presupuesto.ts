import { esPedidoVivo } from "@/features/eventos/domain/edicion";
import { estadoVisible, type Pedido } from "@/features/pedidos/domain/pedido";

// Cuánto va el evento contra lo que el cliente quiere gastar.
// Apartado = pedidos vivos (con envío). Sin apartar = lo que falta apartar (sin envío aún).
export type ResumenPresupuesto = {
  presupuestoCentavos: number;
  apartadoCentavos: number;
  sinApartarCentavos: number;
  gastadoCentavos: number;
  /** Negativo si ya se pasó */
  restanteCentavos: number;
  /** 0 a 100 para la barra */
  porcentaje: number;
  excedido: boolean;
};

type Entrada = {
  presupuestoCentavos: number;
  pedidos: readonly Pick<Pedido, "estado" | "expiraAt" | "subtotalCentavos" | "costoEnvioCentavos">[];
  sinApartarCentavos: number;
};

export function resumirPresupuesto({ presupuestoCentavos, pedidos, sinApartarCentavos }: Entrada): ResumenPresupuesto {
  const apartadoCentavos = pedidos
    .filter((pedido) => esPedidoVivo({ estado: estadoVisible(pedido) }))
    .reduce((total, pedido) => total + pedido.subtotalCentavos + pedido.costoEnvioCentavos, 0);
  const gastadoCentavos = apartadoCentavos + sinApartarCentavos;
  const restanteCentavos = presupuestoCentavos - gastadoCentavos;

  return {
    presupuestoCentavos,
    apartadoCentavos,
    sinApartarCentavos,
    gastadoCentavos,
    restanteCentavos,
    porcentaje: Math.min(100, Math.round((gastadoCentavos / presupuestoCentavos) * 100)),
    excedido: restanteCentavos < 0,
  };
}
