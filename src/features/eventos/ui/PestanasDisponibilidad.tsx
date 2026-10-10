import Link from "next/link";
import { TIPOS_PRODUCTO, type TipoProducto } from "@/features/catalogo/domain/producto";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";

type Props = {
  rutaBase: string;
  activa: TipoProducto;
  conteos: Record<TipoProducto, number>;
};

export function PestanasDisponibilidad({ rutaBase, activa, conteos }: Props) {
  return (
    <nav className="flex gap-6 border-b border-borde text-sm" aria-label="Tipo de producto">
      {TIPOS_PRODUCTO.map((tipo) => {
        const esActiva = tipo === activa;
        return (
          <Link
            key={tipo}
            href={`${rutaBase}?tab=${tipo}`}
            scroll={false}
            aria-current={esActiva ? "page" : undefined}
            className={`-mb-px flex items-center gap-1.5 border-b-[3px] pb-2.5 transition ${
              esActiva ? "border-sandia font-bold" : "border-transparent text-gris hover:text-tinta"
            }`}
          >
            {ESTRATEGIAS_TIPO[tipo].etiqueta}
            <span
              className={`rounded-full px-1.5 text-[11px] ${esActiva ? "bg-rosa text-sandia" : "bg-borde"}`}
            >
              {conteos[tipo]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
