import type { PaymentGateway } from "../domain/pago";
import { crearPasarelaSimulada } from "./pasarelaSimulada";

// Único lugar que decide qué pasarela usa la app
export function obtenerPasarela(): PaymentGateway {
  return crearPasarelaSimulada();
}
