"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import type { Zona } from "@/shared/catalogos";
import { AreaTexto } from "@/shared/ui/AreaTexto";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import type { Emprendimiento } from "../domain/emprendimiento";
import { SelectorLogo } from "./SelectorLogo";
import { SelectorZonas } from "./SelectorZonas";

type Props = {
  zonas: readonly Zona[];
  emprendimiento?: Emprendimiento;
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
  textoBoton: string;
};

// Mismo formulario para crear y para editar el emprendimiento
export function EmprendimientoForm({ zonas, emprendimiento, accion, textoBoton }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);

  // Enviamos a mano para que el formulario NO se limpie si hay un error
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <SelectorLogo actual={emprendimiento?.logoUrl} />
      <Campo
        label="Nombre del emprendimiento"
        name="nombre"
        maxLength={60}
        defaultValue={emprendimiento?.nombre}
        required
      />
      <AreaTexto
        label="Descripción"
        name="descripcion"
        rows={3}
        maxLength={400}
        defaultValue={emprendimiento?.descripcion ?? ""}
        placeholder="Cuéntale a tus clientes qué haces y qué te hace especial"
      />
      <SelectorZonas zonas={zonas} iniciales={emprendimiento?.zonas} />

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}
      {estado.mensaje && (
        <p role="status" className="rounded-card bg-rosa p-3 text-sm font-medium">
          {estado.mensaje}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : textoBoton}
      </Button>
    </form>
  );
}
