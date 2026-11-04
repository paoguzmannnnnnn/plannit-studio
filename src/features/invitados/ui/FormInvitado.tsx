"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { Campo } from "@/shared/ui/Campo";
import { Selector } from "@/shared/ui/Selector";
import { MAX_PERSONAS } from "../domain/invitados";

type Props = { accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion> };

const OPCIONES_PERSONAS = Array.from({ length: MAX_PERSONAS }, (_, i) => ({
  valor: i + 1,
  etiqueta: i === 0 ? "1 persona" : `${i + 1} personas`,
}));

export function FormInvitado({ accion }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const formulario = useRef<HTMLFormElement>(null);

  // Al agregar, el formulario se limpia y el cursor vuelve al nombre para seguir anotando
  useEffect(() => {
    if (!estado.mensaje) return;
    formulario.current?.reset();
    formulario.current?.querySelector<HTMLInputElement>("input[name=nombre]")?.focus();
  }, [estado]);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form ref={formulario} onSubmit={enviar} className="flex flex-col gap-3 rounded-2xl border border-dashed border-borde bg-fondo p-3">
      <p className="text-sm font-bold">Agregar invitado</p>
      <div className="grid grid-cols-[1fr_8.5rem] gap-2">
        <Campo label="Nombre" name="nombre" placeholder="Familia López" maxLength={60} required />
        <Selector label="¿Cuántos?" name="personas" defaultValue={1} opciones={OPCIONES_PERSONAS} />
      </div>
      <Campo label="Nota (opcional)" name="nota" placeholder="Vienen con un bebé" maxLength={120} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pendiente}
          className="h-11 rounded-full bg-tinta px-5 text-sm font-bold text-fondo transition hover:brightness-125 disabled:opacity-50"
        >
          {pendiente ? "Agregando…" : "Agregar a la lista"}
        </button>
        {estado.error && (
          <p role="alert" className="text-sm text-sandia">
            {estado.error}
          </p>
        )}
        {estado.mensaje && (
          <p role="status" className="text-sm text-gris">
            {estado.mensaje}
          </p>
        )}
      </div>
    </form>
  );
}
