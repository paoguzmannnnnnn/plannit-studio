"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { Campo } from "@/shared/ui/Campo";

type Props = { accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion> };

export function FormMomento({ accion }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const formulario = useRef<HTMLFormElement>(null);

  // Si se guardó, el formulario queda listo para el siguiente momento
  useEffect(() => {
    if (estado.mensaje) formulario.current?.reset();
  }, [estado]);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form ref={formulario} onSubmit={enviar} className="flex flex-col gap-3 rounded-2xl border border-dashed border-borde bg-fondo p-3">
      <p className="text-sm font-bold">Agregar un momento</p>
      <div className="grid grid-cols-[7.5rem_1fr] gap-2">
        <Campo label="Hora" name="hora" type="time" required />
        <Campo label="¿Qué pasa?" name="titulo" placeholder="Llegan los invitados" maxLength={60} required />
      </div>
      <Campo label="Nota (opcional)" name="nota" placeholder="Que la música ya esté sonando" maxLength={200} />
      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="h-11 self-start rounded-full bg-tinta px-5 text-sm font-bold text-fondo transition hover:brightness-125 disabled:opacity-50"
      >
        {pendiente ? "Agregando…" : "Agregar a la agenda"}
      </button>
    </form>
  );
}
