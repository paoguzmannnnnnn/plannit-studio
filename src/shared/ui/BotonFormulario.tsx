"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

// Botón para formularios con server actions: se desactiva y atenúa mientras se envía
export function BotonFormulario({
  disabled,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={disabled || pending}
      className={`${className} ${pending ? "opacity-50" : ""}`}
      {...props}
    />
  );
}
