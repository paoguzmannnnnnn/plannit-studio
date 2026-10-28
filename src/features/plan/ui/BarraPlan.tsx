import Link from "next/link";
import { formatearDolares } from "@/shared/dinero";

type Props = { eventoId: string; cantidad: number; subtotalCentavos: number };

// Barra fija sobre la navegación: lo que llevas sin apartar, con regreso al plan
export function BarraPlan({ eventoId, cantidad, subtotalCentavos }: Props) {
  return (
    <Link
      href={`/eventos/${eventoId}`}
      className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center justify-between rounded-card bg-sandia px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95"
    >
      <span>
        Tu plan · {cantidad} sin apartar
      </span>
      <span>{formatearDolares(subtotalCentavos)} ›</span>
    </Link>
  );
}
