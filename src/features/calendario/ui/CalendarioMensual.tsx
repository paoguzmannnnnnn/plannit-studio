import Link from "next/link";
import type { FechaISO } from "@/shared/fechas";
import { estadoDelDia } from "../domain/fechasBloqueadas";
import { celdasDelMes, claveMes, nombreDelMes, sumarMeses, type Mes } from "../domain/mes";
import { DiaCalendario } from "./DiaCalendario";

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  mes: Mes;
  hoy: FechaISO;
  bloqueadas: ReadonlySet<FechaISO>;
  puedeRetroceder: boolean;
  puedeAvanzar: boolean;
};

function FlechaMes({ mes, habilitada, etiqueta, simbolo }: {
  mes: Mes;
  habilitada: boolean;
  etiqueta: string;
  simbolo: string;
}) {
  const clase = "flex size-9 items-center justify-center rounded-full border border-borde text-lg";

  return habilitada ? (
    <Link
      href={`/panel/calendario?mes=${claveMes(mes)}`}
      aria-label={etiqueta}
      className={`${clase} bg-white transition hover:border-sandia`}
    >
      {simbolo}
    </Link>
  ) : (
    <span aria-hidden className={`${clase} text-borde`}>
      {simbolo}
    </span>
  );
}

export function CalendarioMensual({ mes, hoy, bloqueadas, puedeRetroceder, puedeAvanzar }: Props) {
  return (
    <section className="rounded-card border border-borde bg-white p-4">
      <header className="mb-4 flex items-center justify-between">
        <FlechaMes
          mes={sumarMeses(mes, -1)}
          habilitada={puedeRetroceder}
          etiqueta="Mes anterior"
          simbolo="‹"
        />
        <h2 className="font-display text-xl font-black first-letter:uppercase">{nombreDelMes(mes)}</h2>
        <FlechaMes
          mes={sumarMeses(mes, 1)}
          habilitada={puedeAvanzar}
          etiqueta="Mes siguiente"
          simbolo="›"
        />
      </header>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-gris" aria-hidden>
        {DIAS_SEMANA.map((dia, indice) => (
          <span key={indice}>{dia}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdasDelMes(mes).map((fecha, indice) =>
          fecha ? (
            <DiaCalendario
              key={fecha}
              fecha={fecha}
              estado={estadoDelDia(fecha, hoy, bloqueadas)}
              esHoy={fecha === hoy}
            />
          ) : (
            <span key={`vacia-${indice}`} />
          ),
        )}
      </div>
    </section>
  );
}
