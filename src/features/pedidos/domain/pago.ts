// ---------------------------------------------------------------------
// ADAPTER: la app solo conoce este contrato. Hoy lo implementa una
// pasarela simulada; mañana una real (Wompi, Stripe…) sin tocar el resto.
// ---------------------------------------------------------------------
export type SolicitudPago = {
  pedidoId: string;
  montoCentavos: number;
  descripcion: string;
};

export type ResultadoPago = { ok: true; referencia: string } | { ok: false; motivo: string };

export interface PaymentGateway {
  cobrar(solicitud: SolicitudPago): Promise<ResultadoPago>;
}
