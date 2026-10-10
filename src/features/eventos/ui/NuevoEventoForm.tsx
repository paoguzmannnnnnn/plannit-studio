"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { ESTADO_INICIAL } from "@/shared/acciones";
import type { Zona } from "@/shared/catalogos";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { Selector } from "@/shared/ui/Selector";
import { crearEvento } from "../application/actions";
import { TIPOS_EVENTO } from "../domain/evento";

type Props = { zonas: readonly Zona[]; fechaMinima: string; fechaMaxima: string };

export function NuevoEventoForm({ zonas, fechaMinima, fechaMaxima }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(crearEvento, ESTADO_INICIAL);

  // Enviamos a mano para que el formulario NO se limpie si hay un error
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Campo label="Nombre del evento" name="nombre" placeholder="Cumple de Sofi" maxLength={60} required />

      <Selector
        label="Tipo de evento"
        name="tipo"
        placeholder="Elige uno"
        defaultValue=""
        opciones={TIPOS_EVENTO.map((tipo) => ({ valor: tipo, etiqueta: tipo }))}
        required
      />

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Fecha" name="fecha" type="date" min={fechaMinima} max={fechaMaxima} required />
          <Campo label="Hora de entrega" name="hora" type="time" defaultValue="14:00" required />
        </div>
        <p className="text-xs text-gris">
          La hora de entrega es cuando la decoración tiene que estar lista, normalmente unas horas
          antes de que empiece tu evento. Con esto calculamos qué alcanza a llegar.
        </p>
      </div>

      <Selector
        label="Zona"
        name="zona"
        placeholder="¿En qué departamento es?"
        defaultValue=""
        opciones={zonas.map((zona) => ({ valor: zona.id, etiqueta: zona.nombre }))}
        required
      />

      <Campo
        label="Dirección de entrega"
        name="direccion"
        placeholder="Colonia, calle, número de casa o salón"
        maxLength={200}
        required
      />

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Creando…" : "Crear evento y ver opciones"}
      </Button>
    </form>
  );
}
