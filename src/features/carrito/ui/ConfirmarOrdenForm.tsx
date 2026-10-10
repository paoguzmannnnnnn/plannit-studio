"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import { Button } from "@/shared/ui/Button";

type Props = {
  accion: (estado: EstadoAccion) => Promise<EstadoAccion>;
  habilitado: boolean;
  texto: string;
};

export function ConfirmarOrdenForm({ accion, habilitado, texto }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);

  return (
    <form action={ejecutar} className="flex flex-col gap-2">
      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}
      <Button type="submit" disabled={!habilitado || pendiente}>
        {pendiente ? "Confirmando…" : texto}
      </Button>
    </form>
  );
}
