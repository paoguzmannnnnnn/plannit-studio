import Image from "next/image";
import Link from "next/link";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";
import { formatearDolares } from "@/shared/dinero";
import { StickerFoto } from "@/shared/ui/StickerFoto";
import type { ProductoDisponible } from "../domain/evento";

type Props = { producto: ProductoDisponible; eventoId: string };

export function TarjetaDisponible({ producto, eventoId }: Props) {
  const envio =
    producto.costoEnvioCentavos === 0
      ? "Envío gratis"
      : `+ ${formatearDolares(producto.costoEnvioCentavos)} de envío`;

  return (
    <Link
      href={`/productos/${producto.id}?evento=${eventoId}`}
      className="group flex flex-col overflow-hidden rounded-card border border-borde bg-white transition hover:border-sandia"
    >
      <div className="relative aspect-[4/3] bg-rosa">
        {producto.fotoUrl && (
          <Image
            src={producto.fotoUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
        <StickerFoto>{ESTRATEGIAS_TIPO[producto.tipo].etiquetaDisponibilidad(producto.disponibles)}</StickerFoto>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="line-clamp-2 text-sm font-bold">{producto.nombre}</p>
        <p className="truncate text-xs text-gris">{producto.emprendimiento.nombre}</p>
        <div className="mt-auto pt-2">
          <p className="text-sm font-bold">{formatearDolares(producto.precioCentavos)}</p>
          <p className="text-[11px] text-gris">{envio}</p>
        </div>
      </div>
    </Link>
  );
}
