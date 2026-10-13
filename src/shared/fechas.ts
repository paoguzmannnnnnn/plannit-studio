// Fechas de calendario como texto "YYYY-MM-DD", siempre en hora de El Salvador.
// Trabajar con texto evita los errores de zona horaria de Date.
export type FechaISO = string;

export const ZONA_HORARIA = "America/El_Salvador";

// El Salvador no usa horario de verano: siempre UTC-6
const DESFASE_EL_SALVADOR = "-06:00";

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const MS_POR_HORA = 60 * 60 * 1000;

// "en-CA" formatea como YYYY-MM-DD
const FORMATO_ISO_LOCAL = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA });

// "14:30" en 24 horas, para precargar inputs type="time"
const FORMATO_HORA_24 = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: ZONA_HORARIA,
});

const FORMATO_LARGO = new Intl.DateTimeFormat("es-SV", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const FORMATO_DIA = new Intl.DateTimeFormat("es-SV", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: ZONA_HORARIA,
});

const FORMATO_HORA = new Intl.DateTimeFormat("es-SV", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: ZONA_HORARIA,
});

// Node y el navegador usan espacios distintos (normal, no-break, narrow no-break).
// Se ven iguales pero React los ve diferentes y marca error de hidratación.
const ESPACIOS_ESPECIALES = /[  ]/g;

function formatear(formato: Intl.DateTimeFormat, fecha: Date): string {
  return formato.format(fecha).replace(ESPACIOS_ESPECIALES, " ");
}

const plural = (cantidad: number, singular: string, varios: string) =>
  `${cantidad} ${cantidad === 1 ? singular : varios}`;

export function hoyLocal(): FechaISO {
  return FORMATO_ISO_LOCAL.format(new Date());
}

export function esFechaISO(valor: string): boolean {
  if (!PATRON_FECHA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  const resultado = new Date(`${fecha}T00:00:00Z`);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

// "2026-10-14" + "14:30" -> "2026-10-14T14:30:00-06:00" (listo para timestamptz)
export function momentoLocal(fecha: FechaISO, hora: string): string {
  return `${fecha}T${hora}:00${DESFASE_EL_SALVADOR}`;
}

// Lo contrario: timestamptz -> { fecha: "2026-10-14", hora: "14:30" } en hora de El Salvador
export function partesLocales(momento: string): { fecha: FechaISO; hora: string } {
  const fecha = new Date(momento);
  return { fecha: FORMATO_ISO_LOCAL.format(fecha), hora: FORMATO_HORA_24.format(fecha) };
}

// "2026-10-14" -> "miércoles, 14 de octubre"
export function formatearFechaLarga(fecha: FechaISO): string {
  return formatear(FORMATO_LARGO, new Date(`${fecha}T00:00:00Z`));
}

// timestamptz -> "mié, 14 oct"
export function formatearDia(momento: string): string {
  return formatear(FORMATO_DIA, new Date(momento));
}

// timestamptz -> "2:30 p. m."
export function formatearHora(momento: string): string {
  return formatear(FORMATO_HORA, new Date(momento));
}

// Hoy -> solo la hora; otro día -> "mié, 14 oct"
export function formatearCuando(momento: string): string {
  const dia = FORMATO_ISO_LOCAL.format(new Date(momento));
  return dia === hoyLocal() ? formatearHora(momento) : formatearDia(momento);
}

// timestamptz -> "mié, 14 oct · 2:30 p. m."
export function formatearMomento(momento: string): string {
  return `${formatearDia(momento)} · ${formatearHora(momento)}`;
}

export function horasHasta(momento: string, ahora: number = Date.now()): number {
  return (new Date(momento).getTime() - ahora) / MS_POR_HORA;
}

// "Faltan 3 días" / "Faltan 5 horas" / "Ya pasó"
export function tiempoRestante(momento: string, ahora: number = Date.now()): string {
  const horas = Math.floor(horasHasta(momento, ahora));
  if (horas < 0) return "Ya pasó";
  if (horas < 24) return `Faltan ${plural(horas, "hora", "horas")}`;
  return `Faltan ${plural(Math.floor(horas / 24), "día", "días")}`;
}
