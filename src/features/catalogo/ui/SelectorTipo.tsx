import { TIPOS_PRODUCTO, type TipoProducto } from "../domain/producto";
import { ESTRATEGIAS_TIPO } from "../domain/tiposProducto";

type Props = { valor: TipoProducto; onCambio: (tipo: TipoProducto) => void };

export function SelectorTipo({ valor, onCambio }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Tipo de producto</legend>
      <div className="grid grid-cols-2 gap-2">
        {TIPOS_PRODUCTO.map((tipo) => {
          const { etiqueta, descripcion } = ESTRATEGIAS_TIPO[tipo];
          return (
            <label
              key={tipo}
              className="cursor-pointer rounded-card border border-borde bg-white p-4 transition has-[:checked]:border-sandia has-[:checked]:bg-rosa has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia"
            >
              <input
                type="radio"
                name="tipo"
                value={tipo}
                checked={valor === tipo}
                onChange={() => onCambio(tipo)}
                className="sr-only"
              />
              <span className="block text-sm font-bold">{etiqueta}</span>
              <span className="mt-1 block text-xs text-gris">{descripcion}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
