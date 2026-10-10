"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/shared/acciones";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { registrarse } from "../application/actions";
import type { Rol } from "../domain/roles";

const OPCIONES_ROL = [
  { valor: "cliente", titulo: "Quiero organizar", detalle: "Busco decoración para mi evento" },
  { valor: "emprendedor", titulo: "Ofrezco decoración", detalle: "Quiero vender en Plannit" },
] as const satisfies readonly { valor: Rol; titulo: string; detalle: string }[];

export function RegistroForm() {
  const [estado, accion, pendiente] = useActionState(registrarse, ESTADO_INICIAL);

  if (estado.mensaje) {
    return <p className="rounded-card bg-rosa p-4 text-sm">{estado.mensaje}</p>;
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">¿Cómo vas a usar Plannit?</legend>
        <div className="grid grid-cols-2 gap-2">
          {OPCIONES_ROL.map((opcion, indice) => (
            <label
              key={opcion.valor}
              className="cursor-pointer rounded-card border border-borde bg-white p-4 transition has-[:checked]:border-sandia has-[:checked]:bg-rosa has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia"
            >
              <input
                type="radio"
                name="rol"
                value={opcion.valor}
                defaultChecked={indice === 0}
                className="sr-only"
              />
              <span className="block text-sm font-bold">{opcion.titulo}</span>
              <span className="mt-1 block text-xs text-gris">{opcion.detalle}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Campo label="Nombre" name="nombre" autoComplete="name" required />
      <Campo label="Correo" name="email" type="email" autoComplete="email" required />
      <Campo label="Contraseña" name="password" type="password" autoComplete="new-password" required />

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-gris">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-tinta">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
