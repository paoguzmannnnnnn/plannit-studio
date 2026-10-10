import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { crearEmprendimiento } from "@/features/emprendimientos/application/actions";
import { obtenerMiEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { EmprendimientoForm } from "@/features/emprendimientos/ui/EmprendimientoForm";
import { ResumenEmprendimiento } from "@/features/emprendimientos/ui/ResumenEmprendimiento";
import { obtenerPendientes } from "@/features/pedidos/application/pendientes";
import { FilaPedido } from "@/features/pedidos/ui/FilaPedido";
import { crearRepositorioResenas } from "@/features/resenas/infrastructure/resenaRepository";
import { TarjetaResena } from "@/features/resenas/ui/TarjetaResena";
import { listarZonas } from "@/shared/catalogos";
import { createClient } from "@/shared/supabase/server";

const RESENAS_EN_PANEL = 5;

export default async function PanelPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");

  const emprendimiento = await obtenerMiEmprendimiento();

  if (!emprendimiento) {
    const zonas = await listarZonas(await createClient());
    return (
      <>
        <div>
          <h1 className="font-display text-3xl font-black">Cuéntanos de tu emprendimiento</h1>
          <p className="mt-2 text-sm text-gris">Esto es lo que van a ver tus clientes.</p>
        </div>
        <EmprendimientoForm
          zonas={zonas}
          accion={crearEmprendimiento}
          textoBoton="Crear mi emprendimiento"
        />
      </>
    );
  }

  const [pendientes, resenas] = await Promise.all([
    obtenerPendientes(),
    crearRepositorioResenas(await createClient()).listarDeEmprendimiento(emprendimiento.id, RESENAS_EN_PANEL),
  ]);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-black">Hola, {usuario.nombre}</h1>
        <Link
          href="/panel/emprendimiento"
          className="shrink-0 rounded-full border border-borde bg-white px-4 py-2 text-sm font-bold transition hover:border-sandia"
        >
          Editar
        </Link>
      </div>
      {pendientes.length > 0 && (
        <section className="flex flex-col gap-3 rounded-card bg-rosa p-4">
          <h2 className="text-sm font-bold">
            {pendientes.length === 1
              ? "Tienes 1 pedido por atender"
              : `Tienes ${pendientes.length} pedidos por atender`}
          </h2>
          <ul className="flex flex-col gap-2">
            {pendientes.map((pedido) => (
              <li key={pedido.id}>
                <FilaPedido pedido={pedido} rol="emprendedor" href={`/panel/pedidos/${pedido.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <ResumenEmprendimiento emprendimiento={emprendimiento} />
      {resenas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-black">Lo que dicen tus clientes</h2>
          <ul className="flex flex-col gap-3">
            {resenas.map((resena) => (
              <li key={resena.id}>
                <TarjetaResena resena={resena} emprendimiento={emprendimiento.nombre} puedeResponder />
              </li>
            ))}
          </ul>
        </section>
      )}
      <Link
        href="/panel/catalogo"
        className="flex h-12 items-center justify-center rounded-full bg-sandia text-sm font-bold text-white transition hover:brightness-95"
      >
        Ir a mi catálogo
      </Link>
    </>
  );
}
