const FORMATO_USD = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });

// Node y el navegador usan espacios distintos al formatear; se normalizan para que coincidan
const ESPACIOS_ESPECIALES = /[\u00a0\u202f]/g;

export function aCentavos(monto: string | number): number {
  return Math.round(Number(monto) * 100);
}

export function formatearDolares(centavos: number): string {
  return FORMATO_USD.format(centavos / 100).replace(ESPACIOS_ESPECIALES, " ");
}

// Para precargar inputs de precio: 2550 -> "25.50"
export function aMontoEditable(centavos: number): string {
  return (centavos / 100).toFixed(2);
}