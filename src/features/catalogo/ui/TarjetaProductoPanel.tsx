import Image from "next/image";
import Link from "next/link";
import { formatearDolares } from "@/shared/dinero";
import type { Producto } from "../domain/producto";
import { ESTRATEGIAS_TIPO } from "../domain/tiposProducto";

export function TarjetaProductoPanel({ producto }: { producto: Producto }) {
  const estrategia = ESTRATEGIAS_TIPO[producto.tipo];
  const portada = producto.fotos[0];

  return (
    <Link
      href={`/panel/catalogo/${producto.id}`}
      className={`flex items-center gap-4 rounded-card border border-borde bg-white p-3 transition hover:border-sandia ${producto.activo ? "" : "opacity-60"}`}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-rosa">
        {portada && (
          <Image src={portada.url} alt={producto.nombre} fill sizes="80px" className="object-cover" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-rosa px-2 py-0.5 text-[11px] font-bold text-sandia">
            {estrategia.etiqueta}
          </span>
          {!producto.activo && (
            <span className="rounded-full bg-borde px-2 py-0.5 text-[11px] font-bold text-gris">
              Pausado
            </span>
          )}
        </div>
        <p className="truncate font-bold">{producto.nombre}</p>
        <p className="truncate text-xs text-gris">{estrategia.resumen(producto)}</p>
      </div>

      <span className="shrink-0 text-sm font-bold">{formatearDolares(producto.precioCentavos)}</span>
    </Link>
  );
}
