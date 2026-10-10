import type { Producto } from "../domain/producto";
import { cambiarActivo } from "../application/actions";

export function InterruptorActivo({ producto }: { producto: Producto }) {
  const { activo } = producto;

  return (
    <form
      action={cambiarActivo.bind(null, producto.id, !activo)}
      className="flex items-center justify-between gap-4 rounded-card border border-borde bg-white p-4"
    >
      <div>
        <p className="text-sm font-bold">{activo ? "Visible para clientes" : "Producto pausado"}</p>
        <p className="text-xs text-gris">
          {activo ? "Aparece en tu catálogo y se puede comprar." : "No aparece para los clientes."}
        </p>
      </div>
      <button className="shrink-0 rounded-full border border-borde px-4 py-2 text-sm font-bold transition hover:border-sandia">
        {activo ? "Pausar" : "Reactivar"}
      </button>
    </form>
  );
}
