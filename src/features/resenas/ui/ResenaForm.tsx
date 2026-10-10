"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { AreaTexto } from "@/shared/ui/AreaTexto";
import { Button } from "@/shared/ui/Button";
import { SelectorFotos } from "@/shared/ui/SelectorFotos";
import { MAX_FOTOS_RESENA } from "../domain/resena";
import { SelectorEstrellas } from "./SelectorEstrellas";

type Props = {
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
  emprendimiento: string;
};

export function ResenaForm({ accion, emprendimiento }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);

  // Enviamos a mano para que el formulario NO se limpie si hay un error
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  if (estado.mensaje) {
    return <p className="rounded-card bg-rosa p-4 text-sm font-medium">{estado.mensaje}</p>;
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-card border border-dashed border-sandia p-4">
      <div>
        <p className="font-display text-xl font-black">¿Qué tal {emprendimiento}?</p>
        <p className="text-xs text-gris">Tu reseña ayuda a otros a elegir y al emprendedor a mejorar.</p>
      </div>

      <SelectorEstrellas />
      <AreaTexto
        label="Cuéntanos más (opcional)"
        name="comentario"
        rows={3}
        maxLength={500}
        placeholder="¿Llegó a tiempo? ¿Quedó como lo imaginabas?"
      />
      <SelectorFotos
        name="fotos"
        bucket="resenas"
        disponibles={MAX_FOTOS_RESENA}
        maximoTotal={MAX_FOTOS_RESENA}
        titulo="Fotos de cómo quedó (opcional)"
      />

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Enviando…" : "Publicar reseña"}
      </Button>
    </form>
  );
}
