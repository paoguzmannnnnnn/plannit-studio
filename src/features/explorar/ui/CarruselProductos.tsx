import type { EstadisticasProducto, TarjetaProducto as Tarjeta } from "../domain/vistas";
import { TarjetaProducto } from "./TarjetaProducto";

type Props = {
  titulo: string;
  detalle: string;
  productos: readonly Tarjeta[];
  estadisticas: ReadonlyMap<string, EstadisticasProducto>;
};

export function CarruselProductos({ titulo, detalle, productos, estadisticas }: Props) {
  if (productos.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-2xl font-black">{titulo}</h2>
        <p className="text-sm text-gris">{detalle}</p>
      </div>
      <ul className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
        {productos.map((producto) => (
          <li key={producto.id} className="flex w-44 shrink-0 snap-start sm:w-52">
            <TarjetaProducto producto={producto} estadisticas={estadisticas.get(producto.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
