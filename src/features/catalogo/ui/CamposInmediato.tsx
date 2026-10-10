import { Campo } from "@/shared/ui/Campo";
import type { CamposTipo } from "../domain/producto";

export function CamposInmediato({ valores }: { valores?: CamposTipo }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Campo
        label="Unidades por fecha"
        name="stock"
        inputMode="numeric"
        defaultValue={valores?.stockPorFecha ?? ""}
        placeholder="3"
        required
      />
      <Campo
        label="Horas de preparación"
        name="horas_preparacion"
        inputMode="numeric"
        defaultValue={valores?.anticipacionHoras ?? 0}
      />
      <p className="col-span-2 text-xs text-gris">
        Unidades por fecha: cuántas puedes entregar para un mismo día. Si lo tienes listo para
        entregar ya, deja las horas en 0.
      </p>
    </div>
  );
}
