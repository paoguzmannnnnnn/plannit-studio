import type { PaymentGateway } from "../domain/pago";

const DEMORA_MS = 700;

// Simula una pasarela: espera un momento y aprueba. No cobra nada.
export function crearPasarelaSimulada(): PaymentGateway {
  return {
    async cobrar({ pedidoId, montoCentavos }) {
      await new Promise((resolver) => setTimeout(resolver, DEMORA_MS));
      if (montoCentavos <= 0) return { ok: false, motivo: "El monto no es válido" };
      return { ok: true, referencia: `SIM-${pedidoId.slice(0, 8).toUpperCase()}-${Date.now()}` };
    },
  };
}
