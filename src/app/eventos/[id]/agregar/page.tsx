import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { subtotalDeItems } from "@/features/carrito/domain/carrito";
import { crearRepositorioCarrito } from "@/features/carrito/infrastructure/carritoRepository";
import type { TipoProducto } from "@/features/catalogo/domain/producto";
import { tipoProductoSchema } from "@/features/catalogo/domain/schemas";
import type { ProductoDisponible } from "@/features/eventos/domain/evento";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { PestanasDisponibilidad } from "@/features/eventos/ui/PestanasDisponibilidad";
import { TarjetaDisponible } from "@/features/eventos/ui/TarjetaDisponible";
import { crearRepositorioExplorar } from "@/features/explorar/infrastructure/explorarRepository";
import { esIdSeccion, perteneceA, SECCIONES, type IdSeccion } from "@/features/plan/domain/secciones";
import { crearRepositorioPlan } from "@/features/plan/infrastructure/planRepository";
import { BarraPlan } from "@/features/plan/ui/BarraPlan";
import { formatearMomento, horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import type { ClienteSupabase } from "@/shared/supabase/tipos";
import { esUuid } from "@/shared/validaciones";

const TEXTOS_PESTANA: Record<TipoProducto, { ayuda: string; vacio: string }> = {
  inmediato: {
    ayuda: "Productos ya hechos que llegan a tiempo a tu zona.",
    vacio: "No hay productos inmediatos disponibles para tu fecha y zona.",
  },
  personalizable: {
    ayuda: "Solo aparecen los que alcanzan a prepararse antes de tu hora de entrega.",
    vacio:
      "Para tu fecha ya no alcanza ningún personalizable. Revisa los inmediatos o crea un evento con más anticipación.",
  },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; seccion?: string }>;
};

// Si se llega desde una sección del plan, solo se muestran sus categorías
async function filtrarPorSeccion(
  supabase: ClienteSupabase,
  seccion: IdSeccion | null,
  listas: Record<TipoProducto, ProductoDisponible[]>,
): Promise<Record<TipoProducto, ProductoDisponible[]>> {
  if (!seccion) return listas;
  const info = await crearRepositorioPlan(supabase).infoProductos(
    [...listas.inmediato, ...listas.personalizable].map((producto) => producto.id),
  );
  const deLaSeccion = (producto: ProductoDisponible) => perteneceA(seccion, info.get(producto.id)?.categoria);
  return {
    inmediato: listas.inmediato.filter(deLaSeccion),
    personalizable: listas.personalizable.filter(deLaSeccion),
  };
}

export default async function AgregarDecoracionPage({ params, searchParams }: Props) {
  const [{ id }, { tab, seccion: seccionPedida }] = await Promise.all([params, searchParams]);
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/eventos/${id}/agregar`);

  const supabase = await createClient();
  const eventos = crearRepositorioEventos(supabase);
  const evento = await eventos.obtener(id);
  if (!evento || evento.clienteId !== usuario.id) notFound();
  if (horasHasta(evento.fechaEntrega) <= 0) redirect(`/eventos/${evento.id}`);

  const seccion = esIdSeccion(seccionPedida) ? seccionPedida : null;
  const [inmediatosTodos, personalizablesTodos, itemsCarrito] = await Promise.all([
    eventos.productosDisponibles(evento.id, "inmediato"),
    eventos.productosDisponibles(evento.id, "personalizable"),
    crearRepositorioCarrito(supabase).listarItems(evento.id),
  ]);
  const listas = await filtrarPorSeccion(supabase, seccion, {
    inmediato: inmediatosTodos,
    personalizable: personalizablesTodos,
  });

  // Si la sección no tiene inmediatos pero sí personalizables, se abre directo en esa pestaña
  const pestanaSugerida: TipoProducto =
    listas.inmediato.length === 0 && listas.personalizable.length > 0 ? "personalizable" : "inmediato";
  const activa = tipoProductoSchema.safeParse(tab).data ?? pestanaSugerida;
  const productos = listas[activa];
  const enCarrito = itemsCarrito.reduce((total, item) => total + item.cantidad, 0);

  // Si no salió nada en ninguna pestaña (sin filtro), vemos si es porque nadie entrega en esa zona
  const sinResultados = inmediatosTodos.length === 0 && personalizablesTodos.length === 0;
  const zonaSinCobertura =
    sinResultados && !(await crearRepositorioExplorar(supabase).hayEmprendimientosEnZona(evento.zona.id));

  const rutaBase = `/eventos/${evento.id}/agregar`;
  const nombreSeccion = seccion ? SECCIONES[seccion].nombre : null;

  return (
    <div className={`flex flex-col gap-5 ${enCarrito > 0 ? "pb-20" : ""}`}>
      <Link href={`/eventos/${evento.id}`} className="text-sm text-gris transition hover:text-tinta">
        ‹ Plan de {evento.nombre}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black">
          {nombreSeccion ? `Elige: ${nombreSeccion.toLowerCase()}` : "Toda la decoración"}
        </h1>
        <p className="text-sm text-gris">
          {formatearMomento(evento.fechaEntrega)} · {evento.zona.nombre}
        </p>
        {nombreSeccion && (
          <Link
            href={`${rutaBase}?tab=${activa}`}
            className="self-start rounded-full border border-borde bg-white px-3 py-1 text-xs transition hover:border-sandia"
          >
            Mostrando solo {nombreSeccion} · <span className="font-bold text-sandia">Ver todo</span>
          </Link>
        )}
      </div>

      {zonaSinCobertura ? (
        <section className="flex flex-col items-center gap-2 rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center">
          <p className="font-display text-xl font-black">
            Todavía no hay emprendimientos que entreguen en {evento.zona.nombre}
          </p>
          <p className="max-w-sm text-sm text-gris">
            Estamos sumando más emprendedores. Mientras tanto, si tu evento puede ser en otra zona,
            crea uno nuevo con el + de abajo.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <PestanasDisponibilidad
            rutaBase={rutaBase}
            activa={activa}
            conteos={{ inmediato: listas.inmediato.length, personalizable: listas.personalizable.length }}
            parametros={seccion ? { seccion } : {}}
          />
          <p className="text-sm text-gris">{TEXTOS_PESTANA[activa].ayuda}</p>

          {productos.length === 0 ? (
            <p className="rounded-card border border-dashed border-borde bg-white px-6 py-10 text-center text-sm text-gris">
              {nombreSeccion
                ? `No hay opciones de ${nombreSeccion.toLowerCase()} en esta pestaña para tu fecha y zona.`
                : TEXTOS_PESTANA[activa].vacio}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {productos.map((producto) => (
                <li key={producto.id}>
                  <TarjetaDisponible producto={producto} eventoId={evento.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {enCarrito > 0 && (
        <BarraPlan eventoId={evento.id} cantidad={enCarrito} subtotalCentavos={subtotalDeItems(itemsCarrito)} />
      )}
    </div>
  );
}
