import { formatearDia, formatearMomento } from "@/shared/fechas";
import type { TonoEtiqueta } from "@/shared/ui/Etiqueta";
import type { EstadoElemento, Limite } from "../domain/plan";

export const ETIQUETA_ELEMENTO: Record<EstadoElemento, { texto: string; tono: TonoEtiqueta }> = {
  confirmado: { texto: "Confirmado", tono: "suave" },
  por_pagar: { texto: "Por pagar", tono: "sandia" },
  esperando: { texto: "Esperando", tono: "espera" },
  sin_apartar: { texto: "Sin apartar", tono: "punteado" },
};

export function textoLimite(limite: Limite): string {
  switch (limite.tipo) {
    case "todas":
      return `Elígela antes del ${formatearDia(limite.fecha)} para tener todas las opciones`;
    case "ultima":
      return `Elígela antes del ${formatearMomento(limite.fecha)}`;
    case "mismo_dia":
      return "Hay opciones listas hasta el día del evento";
    case "sin_opciones":
      return "Ya no hay opciones para tu fecha y zona";
  }
}
