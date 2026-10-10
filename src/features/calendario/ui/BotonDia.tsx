"use client";

import { useFormStatus } from "react-dom";

type Props = { dia: number; etiqueta: string; bloqueado: boolean; className: string };

// Botón del día con estado de carga mientras se guarda el cambio
export function BotonDia({ dia, etiqueta, bloqueado, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label={etiqueta}
      aria-pressed={bloqueado}
      disabled={pending}
      className={`flex aspect-square w-full items-center justify-center rounded-xl text-sm transition ${className} ${pending ? "opacity-40" : ""}`}
    >
      {dia}
    </button>
  );
}
