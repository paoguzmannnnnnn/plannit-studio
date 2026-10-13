"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import type { Zona } from "@/shared/catalogos";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { Selector } from "@/shared/ui/Selector";
import { TIPOS_EVENTO } from "../domain/evento";

export type ValoresEvento = {
  nombre: string;
  tipo: string;
  fecha: string;
  hora: string;
  zonaId: number;
  direccion: string;
};

type Props = {
  zonas: readonly Zona[];
  fechaMinima: string;
  fechaMaxima: string;
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
  textoBoton: string;
  /** Al editar: lo que ya tiene el evento */
  valores?: ValoresEvento;
  /** Si viene, la fecha y la zona no se pueden cambiar; es el texto que se muestra en su lugar */
  fechaBloqueada?: string;
};

// Mismo formulario para crear y para editar el evento
export function EventoForm({ zonas, fechaMinima, fechaMaxima, accion, textoBoton, valores, fechaBloqueada }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);

  // Enviamos a mano para que el formulario NO se limpie si hay un error
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Campo
        label="Nombre del evento"
        name="nombre"
        placeholder="Cumple de Sofi"
        maxLength={60}
        defaultValue={valores?.nombre}
        required
      />

      <Selector
        label="Tipo de evento"
        name="tipo"
        placeholder="Elige uno"
        defaultValue={valores?.tipo ?? ""}
        opciones={TIPOS_EVENTO.map((tipo) => ({ valor: tipo, etiqueta: tipo }))}
        required
      />

      {fechaBloqueada ? (
        <div className="flex flex-col gap-1 rounded-card bg-rosa p-4 text-sm">
          <p className="font-bold">{fechaBloqueada}</p>
          <p className="text-xs">
            Ya tienes pedidos para este evento, así que la fecha y la zona no se pueden cambiar: los
            emprendedores ya apartaron ese día. Si necesitas moverlo, escríbeles desde tu pedido.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <Campo
                label="Fecha"
                name="fecha"
                type="date"
                min={fechaMinima}
                max={fechaMaxima}
                defaultValue={valores?.fecha}
                required
              />
              <Campo label="Hora de entrega" name="hora" type="time" defaultValue={valores?.hora ?? "14:00"} required />
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
            defaultValue={valores?.zonaId ?? ""}
            opciones={zonas.map((zona) => ({ valor: zona.id, etiqueta: zona.nombre }))}
            required
          />
        </>
      )}

      <Campo
        label="Dirección de entrega"
        name="direccion"
        placeholder="Colonia, calle, número de casa o salón"
        maxLength={200}
        defaultValue={valores?.direccion}
        required
      />

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : textoBoton}
      </Button>
    </form>
  );
}
