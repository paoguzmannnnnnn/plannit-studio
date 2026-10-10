import { notFound } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { escribirAEmprendimiento } from "@/features/chat/application/actions";
import { crearRepositorioExplorar } from "@/features/explorar/infrastructure/explorarRepository";
import { LogoEmprendimiento } from "@/features/explorar/ui/LogoEmprendimiento";
import { SeccionesPorTipo } from "@/features/explorar/ui/SeccionesPorTipo";
import { crearRepositorioResenas } from "@/features/resenas/infrastructure/resenaRepository";
import { TarjetaResena } from "@/features/resenas/ui/TarjetaResena";
import { formatearDolares } from "@/shared/dinero";
import { createClient } from "@/shared/supabase/server";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { Calificacion } from "@/shared/ui/Calificacion";
import { esUuid } from "@/shared/validaciones";
import { EncabezadoPublico } from "../../_componentes/EncabezadoPublico";
import { VolverA } from "../../_componentes/VolverA";

const RESENAS_VISIBLES = 20;

type Props = { params: Promise<{ id: string }> };

export default async function EmprendimientoPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const supabase = await createClient();
  const explorar = crearRepositorioExplorar(supabase);
  const [usuario, emprendimiento, productos, resenas] = await Promise.all([
    obtenerUsuarioActual(),
    explorar.obtenerEmprendimiento(id),
    explorar.listarProductos({ emprendimientoId: id }),
    crearRepositorioResenas(supabase).listarDeEmprendimiento(id, RESENAS_VISIBLES),
  ]);

  if (!emprendimiento) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-6">
      <EncabezadoPublico usuario={usuario} />
      <VolverA href="/">Explorar</VolverA>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <LogoEmprendimiento emprendimiento={emprendimiento} tamano={72} />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-black">{emprendimiento.nombre}</h1>
            <Calificacion
              promedio={emprendimiento.ratingPromedio}
              total={emprendimiento.totalResenas}
              className="text-sm"
            />
          </div>
        </div>

        {emprendimiento.descripcion && (
          <p className="max-w-2xl text-sm text-gris">{emprendimiento.descripcion}</p>
        )}

        {usuario?.rol !== "emprendedor" && (
          <form action={escribirAEmprendimiento.bind(null, emprendimiento.id)}>
            <BotonFormulario className="h-10 rounded-full border border-borde bg-white px-4 text-sm font-bold transition hover:border-sandia">
              Escribir a {emprendimiento.nombre}
            </BotonFormulario>
          </form>
        )}

        <div>
          <h2 className="mb-2 text-sm font-bold">Entrega en</h2>
          <ul className="flex flex-wrap gap-2">
            {emprendimiento.zonas.map((zona) => (
              <li
                key={zona.nombre}
                className="rounded-full border border-borde bg-white px-3 py-1.5 text-xs"
              >
                {zona.nombre} ·{" "}
                {zona.costoEnvioCentavos === 0 ? "envío gratis" : formatearDolares(zona.costoEnvioCentavos)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {productos.length === 0 ? (
        <p className="text-sm text-gris">Este emprendimiento todavía no tiene productos.</p>
      ) : (
        <SeccionesPorTipo productos={productos} />
      )}

      {resenas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-black">Reseñas</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {resenas.map((resena) => (
              <li key={resena.id}>
                <TarjetaResena resena={resena} emprendimiento={emprendimiento.nombre} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
