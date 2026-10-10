import type { FechaISO } from "@/shared/fechas";

// Lógica pura del calendario: sin React ni Supabase, fácil de testear.
export type Mes = { anio: number; mes: number }; // mes: 1–12

const PATRON_MES = /^(\d{4})-(\d{2})$/;

const FORMATO_MES = new Intl.DateTimeFormat("es-SV", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dosDigitos = (numero: number) => String(numero).padStart(2, "0");
const indice = (mes: Mes) => mes.anio * 12 + (mes.mes - 1);
const desdeIndice = (valor: number): Mes => ({ anio: Math.floor(valor / 12), mes: (valor % 12) + 1 });

export function mesDe(fecha: FechaISO): Mes {
  return { anio: Number(fecha.slice(0, 4)), mes: Number(fecha.slice(5, 7)) };
}

// "2026-10" -> { anio: 2026, mes: 10 }; null si no es válido
export function parsearMes(valor: string | undefined): Mes | null {
  const coincidencia = valor?.match(PATRON_MES);
  if (!coincidencia) return null;
  const mes = Number(coincidencia[2]);
  return mes >= 1 && mes <= 12 ? { anio: Number(coincidencia[1]), mes } : null;
}

export function claveMes(mes: Mes): string {
  return `${mes.anio}-${dosDigitos(mes.mes)}`;
}

export function sumarMeses(mes: Mes, cantidad: number): Mes {
  return desdeIndice(indice(mes) + cantidad);
}

export function compararMeses(a: Mes, b: Mes): number {
  return indice(a) - indice(b);
}

export function acotarMes(mes: Mes, minimo: Mes, maximo: Mes): Mes {
  if (compararMeses(mes, minimo) < 0) return minimo;
  if (compararMeses(mes, maximo) > 0) return maximo;
  return mes;
}

export function nombreDelMes(mes: Mes): string {
  return FORMATO_MES.format(new Date(Date.UTC(mes.anio, mes.mes - 1, 1)));
}

function diasEnMes(mes: Mes): number {
  return new Date(Date.UTC(mes.anio, mes.mes, 0)).getUTCDate();
}

export function fechaDelMes(mes: Mes, dia: number): FechaISO {
  return `${claveMes(mes)}-${dosDigitos(dia)}`;
}

export function primerDia(mes: Mes): FechaISO {
  return fechaDelMes(mes, 1);
}

export function ultimoDia(mes: Mes): FechaISO {
  return fechaDelMes(mes, diasEnMes(mes));
}

export function diaDelMes(fecha: FechaISO): number {
  return Number(fecha.slice(8, 10));
}

// Cuadrícula de lunes a domingo; null = celda vacía antes o después del mes
export function celdasDelMes(mes: Mes): (FechaISO | null)[] {
  const domingoACero = new Date(Date.UTC(mes.anio, mes.mes - 1, 1)).getUTCDay();
  const vaciasAlInicio = (domingoACero + 6) % 7; // lunes = 0

  const celdas: (FechaISO | null)[] = [
    ...Array.from({ length: vaciasAlInicio }, () => null),
    ...Array.from({ length: diasEnMes(mes) }, (_, i) => fechaDelMes(mes, i + 1)),
  ];

  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}
