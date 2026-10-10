import Link from "next/link";
import { MESES_MAXIMOS_HACIA_ADELANTE } from "@/features/eventos/domain/schemas";
import { NuevoEventoForm } from "@/features/eventos/ui/NuevoEventoForm";
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
      <NuevoEventoForm
        zonas={zonas}
        fechaMinima={hoy}
        fechaMaxima={sumarDias(hoy, MESES_MAXIMOS_HACIA_ADELANTE * 31)}
      />
    </div>
  );
}
