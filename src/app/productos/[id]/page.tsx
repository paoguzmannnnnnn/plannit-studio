import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { PanelAgregar } from "@/features/carrito/ui/PanelAgregar";
import { personalizacionesPermitidas } from "@/features/catalogo/domain/personalizacion";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";
import { crearRepositorioExplorar } from "@/features/explorar/infrastructure/explorarRepository";
import { GaleriaProducto } from "@/features/explorar/ui/GaleriaProducto";
import { LogoEmprendimiento } from "@/features/explorar/ui/LogoEmprendimiento";
import { formatearDolares } from "@/shared/dinero";
import { createClient } from "@/shared/supabase/server";
import { Calificacion } from "@/shared/ui/Calificacion";
import { esUuid } from "@/shared/validaciones";
import { EncabezadoPublico } from "../../_componentes/EncabezadoPublico";
import { VolverA } from "../../_componentes/VolverA";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ evento?: string }>;
};

export default async function ProductoPage({ params, searchParams }: Props) {
  const [{ id }, { evento }] = await Promise.all([params, searchParams]);
  if (!esUuid(id)) notFound();

  const [usuario, producto] = await Promise.all([
    obtenerUsuarioActual(),
    crearRepositorioExplorar(await createClient()).obtenerProducto(id),
  ]);

  if (!producto) notFound();

  const estrategia = ESTRATEGIAS_TIPO[producto.tipo];
  const personalizaciones = personalizacionesPermitidas(producto);
  const { emprendimiento } = producto;
  const eventoId = evento && esUuid(evento) ? evento : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-6">
      <EncabezadoPublico usuario={usuario} />
      {eventoId ? (
        <VolverA href={`/eventos/${eventoId}/agregar?tab=${producto.tipo}`}>Seguir eligiendo</VolverA>
      ) : (
        <VolverA href={`/emprendimientos/${emprendimiento.id}`}>{emprendimiento.nombre}</VolverA>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <GaleriaProducto fotos={producto.fotos} nombre={producto.nombre} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-start gap-2">
            <span className="-rotate-2 rounded-full bg-rosa px-3 py-1 text-xs font-bold text-sandia">
              {estrategia.etiqueta} · {estrategia.resumenCliente(producto)}
            </span>
            <h1 className="font-display text-3xl font-black">{producto.nombre}</h1>
            <p className="text-2xl font-bold">{formatearDolares(producto.precioCentavos)}</p>
            <p className="text-xs text-gris">{producto.categoria}</p>
          </div>

          {producto.descripcion && (
            <p className="whitespace-pre-line text-sm leading-relaxed">{producto.descripcion}</p>
          )}

          {personalizaciones.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-bold">Puedes personalizar</h2>
              <ul className="flex flex-wrap gap-2">
                {personalizaciones.map((opcion) => (
                  <li key={opcion} className="rounded-full border border-borde bg-white px-3 py-1.5 text-xs">
                    {opcion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {eventoId ? (
            <PanelAgregar producto={producto} eventoId={eventoId} />
          ) : (
            usuario?.rol !== "emprendedor" && (
              <div className="flex flex-col gap-3 rounded-card bg-rosa p-4 text-sm">
                <div>
                  <p className="font-bold">¿Lo quieres para tu evento?</p>
                  <p className="mt-1">Con la fecha y la zona de tu evento te mostramos si llega a tiempo.</p>
                </div>
                <Link
                  href={usuario ? "/eventos" : "/eventos/nuevo"}
                  className="flex h-11 items-center justify-center rounded-full bg-sandia text-sm font-bold text-white transition hover:brightness-95"
                >
                  {usuario ? "Ver mis eventos" : "Crear mi evento"}
                </Link>
              </div>
            )
          )}

          <Link
            href={`/emprendimientos/${emprendimiento.id}`}
            className="flex items-center gap-3 rounded-card border border-borde bg-white p-3 transition hover:border-sandia"
          >
            <LogoEmprendimiento emprendimiento={emprendimiento} tamano={44} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{emprendimiento.nombre}</p>
              <Calificacion promedio={emprendimiento.ratingPromedio} total={emprendimiento.totalResenas} />
            </div>
            <span className="ml-auto text-sm text-gris">Ver todo ›</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
