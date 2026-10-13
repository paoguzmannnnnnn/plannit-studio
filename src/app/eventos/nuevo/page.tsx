import Link from "next/link";
import { crearEvento } from "@/features/eventos/application/actions";
import { MESES_MAXIMOS_HACIA_ADELANTE } from "@/features/eventos/domain/schemas";
import { EventoForm } from "@/features/eventos/ui/EventoForm";
import { listarZonas } from "@/shared/catalogos";
import { hoyLocal, sumarDias } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";

export default async function NuevoEventoPage() {
  const zonas = await listarZonas(await createClient());
  const hoy = hoyLocal();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <Link href="/eventos" className="text-sm text-gris transition hover:text-tinta">
          ‹ Mis eventos
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">¿Qué celebramos?</h1>
        <p className="mt-1 text-sm text-gris">
          Con la fecha y la zona te mostramos solo lo que de verdad llega a tiempo.
        </p>
      </div>
      <EventoForm
        zonas={zonas}
        fechaMinima={hoy}
        fechaMaxima={sumarDias(hoy, MESES_MAXIMOS_HACIA_ADELANTE * 31)}
        accion={crearEvento}
        textoBoton="Crear evento y ver opciones"
      />
    </div>
  );
}
