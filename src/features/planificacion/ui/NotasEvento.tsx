"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { MAX_NOTAS } from "../domain/agenda";

type Props = {
  notas: string | null;
  editable: boolean;
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
};

export function NotasEvento({ notas, editable, accion }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const [texto, setTexto] = useState(notas ?? "");
  const [guardado, setGuardado] = useState(notas ?? "");
  const enviado = useRef(texto);
  // Solo cuando el servidor confirma, lo enviado pasa a ser lo guardado
  useEffect(() => {
    if (estado.mensaje) setGuardado(enviado.current);
  }, [estado]);
  const sinCambios = texto.trim() === guardado.trim();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    enviado.current = texto;
    startTransition(() => ejecutar(datos));
  }

  return (
    <section className="flex flex-col gap-3 rounded-card border border-borde bg-white p-4">
      <div>
        <h3 className="font-bold">Notas</h3>
        <p className="text-xs text-gris">Lo que no quieres olvidar: pendientes, ideas, contactos.</p>
      </div>

      {editable ? (
        <form onSubmit={enviar} className="flex flex-col gap-2">
          <textarea
            name="notas"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={5}
            maxLength={MAX_NOTAS}
            aria-label="Notas del evento"
            placeholder="Confirmar el salón · Comprar velas · Pedirle a la tía Ana las mesas"
            className="w-full min-w-0 rounded-2xl border border-borde bg-fondo px-4 py-3 text-base outline-none transition focus:border-sandia sm:text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gris" role="status">
              {estado.error ? (
                <span className="text-sandia">{estado.error}</span>
              ) : sinCambios && estado.mensaje ? (
                estado.mensaje
              ) : (
                `${texto.length} / ${MAX_NOTAS}`
              )}
            </span>
            <button
              type="submit"
              disabled={pendiente || sinCambios}
              className="h-10 rounded-full bg-tinta px-5 text-sm font-bold text-fondo transition hover:brightness-125 disabled:opacity-40"
            >
              {pendiente ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-line text-sm">{notas || "Sin notas."}</p>
      )}
    </section>
  );
}
