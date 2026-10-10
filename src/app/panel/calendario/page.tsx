import { CalendarioMensual } from "@/features/calendario/ui/CalendarioMensual";
import { LeyendaCalendario } from "@/features/calendario/ui/LeyendaCalendario";
import { crearRepositorioFechasBloqueadas } from "@/features/calendario/infrastructure/fechasBloqueadasRepository";
import {
  acotarMes,
  compararMeses,
  mesDe,
  parsearMes,
  primerDia,
  sumarMeses,
  ultimoDia,
} from "@/features/calendario/domain/mes";
import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { hoyLocal } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";

// Hasta cuántos meses hacia adelante se puede gestionar
const MESES_HACIA_ADELANTE = 12;

type Props = { searchParams: Promise<{ mes?: string }> };

export default async function CalendarioPage({ searchParams }: Props) {
  const emprendimiento = await requerirEmprendimiento();
  const { mes: mesSolicitado } = await searchParams;

  const hoy = hoyLocal();
  const mesActual = mesDe(hoy);
  const mesMaximo = sumarMeses(mesActual, MESES_HACIA_ADELANTE);
  const mes = acotarMes(parsearMes(mesSolicitado) ?? mesActual, mesActual, mesMaximo);

  const fechas = await crearRepositorioFechasBloqueadas(await createClient()).listarEntre(
    emprendimiento.id,
    primerDia(mes),
    ultimoDia(mes),
  );
  const bloqueadas = new Set(fechas);
  const proximasBloqueadas = fechas.filter((fecha) => fecha >= hoy).length;

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-black">Calendario</h1>
        <p className="mt-2 text-sm text-gris">
          Toca un día para bloquearlo. Los días bloqueados no aparecen para los clientes. Tócalo de
          nuevo para liberarlo.
        </p>
      </div>

      <CalendarioMensual
        mes={mes}
        hoy={hoy}
        bloqueadas={bloqueadas}
        puedeRetroceder={compararMeses(mes, mesActual) > 0}
        puedeAvanzar={compararMeses(mes, mesMaximo) < 0}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <LeyendaCalendario />
        <p className="text-xs text-gris">
          {proximasBloqueadas === 0
            ? "No tienes días bloqueados este mes"
            : `${proximasBloqueadas} ${proximasBloqueadas === 1 ? "día bloqueado" : "días bloqueados"} este mes`}
        </p>
      </div>
    </>
  );
}
