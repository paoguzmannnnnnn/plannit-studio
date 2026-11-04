import { X } from "lucide-react";
import Link from "next/link";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { Etiqueta, type TonoEtiqueta } from "@/shared/ui/Etiqueta";
import { agregarInvitado, cambiarEstadoInvitado, quitarInvitado } from "../application/actions";
import {
  ESTADOS_INVITADO,
  ETIQUETA_ESTADO,
  PERSONAS_POR_MESA,
  resumirInvitados,
  type EstadoInvitado,
  type Invitado,
} from "../domain/invitados";
import { FormInvitado } from "./FormInvitado";

type Props = { eventoId: string; invitados: readonly Invitado[]; editable: boolean };

const TONO: Record<EstadoInvitado, TonoEtiqueta> = { confirmado: "sandia", pendiente: "espera", no_va: "neutro" };

const ESTILO_ACTIVO: Record<EstadoInvitado, string> = {
  confirmado: "bg-sandia text-white",
  pendiente: "bg-tinta text-fondo",
  no_va: "bg-borde text-tinta",
};

const personasTexto = (n: number) => (n === 1 ? "1 persona" : `${n} personas`);

function Contador({ valor, etiqueta, destacado = false }: { valor: number; etiqueta: string; destacado?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl px-2 py-3 ${destacado ? "bg-rosa" : "bg-fondo"}`}>
      <span className={`font-display text-2xl font-black ${destacado ? "text-sandia" : ""}`}>{valor}</span>
      <span className="text-xs text-gris">{etiqueta}</span>
    </div>
  );
}

function SelectorEstado({ eventoId, invitado }: { eventoId: string; invitado: Invitado }) {
  return (
    <div className="flex gap-1 rounded-full bg-fondo p-0.5" role="group" aria-label={`¿${invitado.nombre} confirmó?`}>
      {ESTADOS_INVITADO.map((estado) => {
        const activo = invitado.estado === estado;
        return (
          <form key={estado} action={cambiarEstadoInvitado.bind(null, eventoId, invitado.id, estado)}>
            <BotonFormulario
              disabled={activo}
              aria-pressed={activo}
              className={`h-7 rounded-full px-2.5 text-[11px] font-bold transition ${
                activo ? ESTILO_ACTIVO[estado] : "text-gris hover:text-tinta"
              }`}
            >
              {ETIQUETA_ESTADO[estado]}
            </BotonFormulario>
          </form>
        );
      })}
    </div>
  );
}

export function ListaInvitados({ eventoId, invitados, editable }: Props) {
  const resumen = resumirInvitados(invitados);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-card border border-borde bg-white p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-black">Invitados</h2>
          <span className="text-xs text-gris">
            {resumen.invitaciones} {resumen.invitaciones === 1 ? "invitación" : "invitaciones"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Contador valor={resumen.personas.confirmado} etiqueta="Confirmados" destacado />
          <Contador valor={resumen.personas.pendiente} etiqueta="Pendientes" />
          <Contador valor={resumen.personas.no_va} etiqueta="No van" />
        </div>

        {resumen.esperadas > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-fondo px-3 py-2 text-xs">
            <span>
              Para <span className="font-bold">{personasTexto(resumen.esperadas)}</span> necesitas unas{" "}
              <span className="font-bold">
                {resumen.mesas} {resumen.mesas === 1 ? "mesa" : "mesas"} de {PERSONAS_POR_MESA}
              </span>
            </span>
            {editable && (
              <Link href={`/eventos/${eventoId}/agregar?seccion=mesas`} className="font-bold text-sandia">
                Ver mesas ›
              </Link>
            )}
          </div>
        )}

        {editable && <FormInvitado accion={agregarInvitado.bind(null, eventoId)} />}

        {invitados.length === 0 ? (
          <p className="text-center text-sm text-gris">
            {editable ? "Anota a tus invitados y marca quién confirma." : "No anotaste invitados."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-borde">
            {invitados.map((invitado) => (
              <li key={invitado.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${invitado.estado === "no_va" ? "text-gris line-through" : ""}`}>
                      {invitado.nombre}
                    </p>
                    <p className="text-xs text-gris">
                      {personasTexto(invitado.personas)}
                      {invitado.nota && ` · ${invitado.nota}`}
                    </p>
                  </div>
                  {editable && (
                    <form action={quitarInvitado.bind(null, eventoId, invitado.id)} className="sm:order-last">
                      <BotonFormulario
                        aria-label={`Quitar a ${invitado.nombre}`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-gris transition hover:text-sandia"
                      >
                        <X size={14} />
                      </BotonFormulario>
                    </form>
                  )}
                </div>
                {editable ? (
                  <SelectorEstado eventoId={eventoId} invitado={invitado} />
                ) : (
                  <Etiqueta tono={TONO[invitado.estado]}>{ETIQUETA_ESTADO[invitado.estado]}</Etiqueta>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
