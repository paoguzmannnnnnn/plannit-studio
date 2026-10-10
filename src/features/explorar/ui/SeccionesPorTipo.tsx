import { TIPOS_PRODUCTO, type TipoProducto } from "@/features/catalogo/domain/producto";
import type { TarjetaProducto as Tarjeta } from "../domain/vistas";
import { TarjetaProducto } from "./TarjetaProducto";

const TITULOS: Record<TipoProducto, { titulo: string; detalle: string }> = {
  inmediato: { titulo: "Listos para entregar", detalle: "Ya están hechos, los pides y listo." },
  personalizable: { titulo: "Hechos a la medida", detalle: "Se preparan para tu evento, con tiempo." },
};

// Catálogo de un emprendimiento agrupado en Inmediato / Personalizable
export function SeccionesPorTipo({ productos }: { productos: readonly Tarjeta[] }) {
  return (
    <>
      {TIPOS_PRODUCTO.map((tipo) => {
        const delTipo = productos.filter((producto) => producto.tipo === tipo);
        if (delTipo.length === 0) return null;

        return (
          <section key={tipo} className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-2xl font-black">{TITULOS[tipo].titulo}</h2>
              <p className="text-sm text-gris">{TITULOS[tipo].detalle}</p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {delTipo.map((producto) => (
                <li key={producto.id}>
                  <TarjetaProducto producto={producto} mostrarEmprendimiento={false} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
