import { crearRepositorioProductos } from "@/features/catalogo/infrastructure/productoRepository";
import { TarjetaProductoPanel } from "@/features/catalogo/ui/TarjetaProductoPanel";
import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { createClient } from "@/shared/supabase/server";

export default async function CatalogoPage() {
  const emprendimiento = await requerirEmprendimiento();
  const productos = await crearRepositorioProductos(await createClient()).listarPorEmprendimiento(
    emprendimiento.id,
  );

  return (
    <>
      <h1 className="font-display text-3xl font-black">Tu catálogo</h1>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center">
          <p className="font-display text-xl font-black">Tu vitrina está vacía</p>
          <p className="text-sm text-gris">
            Toca el <span className="font-bold text-sandia">+</span> de abajo para agregar tu primer
            producto.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {productos.map((producto) => (
            <li key={producto.id}>
              <TarjetaProductoPanel producto={producto} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
