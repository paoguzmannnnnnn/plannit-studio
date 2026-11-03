"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { normalizarPasos, pasosSugeridos, type IdSeccion } from "@/features/plan/domain/secciones";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import type { Zona } from "@/shared/catalogos";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { Selector } from "@/shared/ui/Selector";
import { TIPOS_EVENTO } from "../domain/evento";
import { SelectorPasos } from "./SelectorPasos";

export type ValoresEvento = {
  nombre: string;
  tipo: string;
  fecha: string;
  hora: string;
  zonaId: number;
  direccion: string;
  pasos: readonly string[];
  /** Como se escribe en el campo ("500" o "") */
  presupuesto: string;
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
  const [tipo, setTipo] = useState(valores?.tipo ?? "");
  const [pasos, setPasos] = useState<ReadonlySet<IdSeccion>>(() => new Set(normalizarPasos(valores?.pasos ?? [])));
  // Mientras el cliente no toque los pasos, se ajustan solos al tipo de evento
  const [tocado, setTocado] = useState(Boolean(valores));

  function cambiarTipo(nuevo: string) {
    setTipo(nuevo);
    if (!tocado) setPasos(new Set(pasosSugeridos(nuevo)));
  }

  function cambiarPasos(siguientes: Set<IdSeccion>) {
    setTocado(true);
    setPasos(siguientes);
  }

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
        value={tipo}
        onChange={(e) => cambiarTipo(e.target.value)}
        opciones={TIPOS_EVENTO.map((opcion) => ({ valor: opcion, etiqueta: opcion }))}
        required
      />

      <SelectorPasos
        elegidos={pasos}
        onCambio={cambiarPasos}
        ayuda={
          valores
            ? "Si quitas un paso, lo que ya elegiste ahí se queda en Extras."
            : tipo
              ? "Te marcamos lo típico para este evento. Quita o agrega lo que quieras."
              : "Elige el tipo de evento y te sugerimos lo típico."
        }
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

      <div id="presupuesto" className="flex scroll-mt-24 flex-col gap-2">
        <Campo
          label="Presupuesto (opcional)"
          name="presupuesto"
          inputMode="decimal"
          placeholder="500"
          defaultValue={valores?.presupuesto}
          maxLength={12}
        />
        <p className="text-xs text-gris">Lo que quieres gastar en decoración. Te avisamos cuánto te queda.</p>
      </div>

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
