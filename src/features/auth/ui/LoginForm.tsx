"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/shared/acciones";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { iniciarSesion } from "../application/actions";

export function LoginForm({ next }: { next?: string }) {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, ESTADO_INICIAL);

  return (
    <form action={accion} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <Campo label="Correo" name="email" type="email" autoComplete="email" required />
      <Campo label="Contraseña" name="password" type="password" autoComplete="current-password" required />

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Entrando…" : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-gris">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold text-tinta">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
