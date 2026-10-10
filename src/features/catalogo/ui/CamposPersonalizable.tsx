import { Campo } from "@/shared/ui/Campo";
import { OPCIONES_PERSONALIZACION } from "../domain/personalizacion";
import type { CamposTipo } from "../domain/producto";
import { diasDeAnticipacion } from "../domain/tiposProducto";

export function CamposPersonalizable({ valores }: { valores?: CamposTipo }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Campo
          label="Días de anticipación"
          name="dias_anticipacion"
          inputMode="numeric"
          defaultValue={valores ? diasDeAnticipacion(valores) : ""}
          placeholder="5"
          required
        />
        <Campo
          label="Pedidos por día"
          name="cupo"
          inputMode="numeric"
          defaultValue={valores?.cupoDiario ?? ""}
          placeholder="2"
          required
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">¿Qué puede personalizar el cliente?</legend>
        <div className="flex flex-wrap gap-2">
          {OPCIONES_PERSONALIZACION.map((opcion) => (
            <label
              key={opcion.campo}
              className="cursor-pointer rounded-full border border-borde bg-white px-4 py-2 text-sm transition has-[:checked]:border-sandia has-[:checked]:bg-rosa has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia"
            >
              <input
                type="checkbox"
                name={opcion.campo}
                defaultChecked={valores?.[opcion.clave] ?? false}
                className="sr-only"
              />
              {opcion.etiqueta}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
