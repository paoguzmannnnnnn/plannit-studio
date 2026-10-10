import { formatearFechaLarga, type FechaISO } from "@/shared/fechas";
import { cambiarBloqueo } from "../application/actions";
import { diaDelMes } from "../domain/mes";
import type { EstadoDia } from "../domain/fechasBloqueadas";
import { BotonDia } from "./BotonDia";

const ESTILOS: Record<EstadoDia, string> = {
  pasado: "text-borde",
  disponible: "border border-borde bg-white hover:border-sandia",
  bloqueado: "bg-sandia font-bold text-white hover:brightness-95",
};

type Props = { fecha: FechaISO; estado: EstadoDia; esHoy: boolean };

export function DiaCalendario({ fecha, estado, esHoy }: Props) {
  const dia = diaDelMes(fecha);
  const resaltarHoy = esHoy && estado === "disponible" ? "font-bold text-sandia" : "";

  if (estado === "pasado") {
    return (
      <span className={`flex aspect-square items-center justify-center text-sm ${ESTILOS.pasado}`}>
        {dia}
      </span>
    );
  }

  const bloqueado = estado === "bloqueado";
  const accion = bloqueado ? "Desbloquear" : "Bloquear";

  return (
    <form action={cambiarBloqueo.bind(null, fecha, !bloqueado)}>
      <BotonDia
        dia={dia}
        bloqueado={bloqueado}
        etiqueta={`${accion} ${formatearFechaLarga(fecha)}`}
        className={`${ESTILOS[estado]} ${resaltarHoy}`}
      />
    </form>
  );
}
