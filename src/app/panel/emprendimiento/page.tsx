import Link from "next/link";
import { actualizarEmprendimiento } from "@/features/emprendimientos/application/actions";
import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { EmprendimientoForm } from "@/features/emprendimientos/ui/EmprendimientoForm";
import { listarZonas } from "@/shared/catalogos";
import { createClient } from "@/shared/supabase/server";

export default async function EditarEmprendimientoPage() {
  const emprendimiento = await requerirEmprendimiento();
  const zonas = await listarZonas(await createClient());

  return (
    <>
      <div>
        <Link href="/panel" className="text-sm text-gris transition hover:text-tinta">
          ‹ Volver al panel
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">Tu emprendimiento</h1>
        <p className="mt-1 text-sm text-gris">
          Los cambios en zonas y envíos se aplican a los nuevos pedidos; los que ya existen
          conservan su costo.
        </p>
      </div>
      <EmprendimientoForm
        zonas={zonas}
        emprendimiento={emprendimiento}
        accion={actualizarEmprendimiento}
        textoBoton="Guardar cambios"
      />
    </>
  );
}
