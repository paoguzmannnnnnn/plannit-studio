import Link from "next/link";
import { formatearDolares } from "@/shared/dinero";

type Props = { eventoId: string; cantidad: number; subtotalCentavos: number };

// Barra fija sobre la navegación: siempre a la vista cuánto llevas
export function BarraCarrito({ eventoId, cantidad, subtotalCentavos }: Props) {
  return (
    <Link
      href={`/eventos/${eventoId}/carrito`}
      className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center justify-between rounded-card bg-sandia px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95"
    >
      <span>
        Carrito · {cantidad} {cantidad === 1 ? "producto" : "productos"}
      </span>
      <span>{formatearDolares(subtotalCentavos)} ›</span>
    </Link>
  );
}
