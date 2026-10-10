"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";

type Props = { accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion> };

export function ResponderForm({ accion }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);

  return (
    <form action={ejecutar} className="flex flex-col gap-2">
      <textarea
        name="respuesta"
        rows={2}
        maxLength={400}
        required
        placeholder="Agradece o aclara algo. Solo puedes responder una vez."
        aria-label="Tu respuesta"
        className="w-full rounded-2xl border border-borde bg-white px-4 py-3 text-base outline-none transition focus:border-sandia sm:text-sm"
      />
      {estado.error && (
        <p role="alert" className="text-xs text-sandia">
          {estado.error}
        </p>
      )}
      <button
        disabled={pendiente}
        className="self-start rounded-full bg-sandia px-4 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-50"
      >
        {pendiente ? "Enviando…" : "Responder"}
      </button>
    </form>
  );
}
