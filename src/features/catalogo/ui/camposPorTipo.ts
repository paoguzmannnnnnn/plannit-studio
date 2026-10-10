import type { ComponentType } from "react";
import type { CamposTipo, TipoProducto } from "../domain/producto";
import { CamposInmediato } from "./CamposInmediato";
import { CamposPersonalizable } from "./CamposPersonalizable";

// Contraparte visual de ESTRATEGIAS_TIPO: qué campos muestra el formulario para cada tipo
export const CAMPOS_POR_TIPO: Record<TipoProducto, ComponentType<{ valores?: CamposTipo }>> = {
  inmediato: CamposInmediato,
  personalizable: CamposPersonalizable,
};
