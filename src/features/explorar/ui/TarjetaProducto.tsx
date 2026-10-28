import Image from "next/image";
import Link from "next/link";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";
import { formatearDolares } from "@/shared/dinero";
import { StickerFoto } from "@/shared/ui/StickerFoto";
import { Calificacion } from "@/shared/ui/Calificacion";
import type { EstadisticasProducto, TarjetaProducto as Tarjeta } from "../domain/vistas";

type Props = { producto: Tarjeta; mostrarEmprendimiento?: boolean; estadisticas?: EstadisticasProducto };

export function TarjetaProducto({ producto, mostrarEmprendimiento = true, estadisticas }: Props) {
  const estrategia = ESTRATEGIAS_TIPO[producto.tipo];

  return (
    <Link
      href={`/productos/${producto.id}`}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-borde bg-white transition hover:border-sandia"
    >
      <div className="relative aspect-[4/3] bg-rosa">
        {producto.portadaUrl && (
          <Image
            src={producto.portadaUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
        <StickerFoto>{estrategia.resumenCliente(producto)}</StickerFoto>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="line-clamp-2 text-sm font-bold">{producto.nombre}</p>
        {mostrarEmprendimiento && (
          <p className="truncate text-xs text-gris">{producto.emprendimiento.nombre}</p>
        )}
        {estadisticas && (
          <Calificacion promedio={estadisticas.ratingPromedio} total={estadisticas.totalResenas} />
        )}
        {estadisticas && estadisticas.vecesElegido > 1 && (
          <p className="text-[11px] font-medium text-sandia">
            Elegido para {estadisticas.vecesElegido} eventos
          </p>
        )}
        <p className="mt-auto pt-2 text-sm font-bold">{formatearDolares(producto.precioCentavos)}</p>
      </div>
    </Link>
  );
}