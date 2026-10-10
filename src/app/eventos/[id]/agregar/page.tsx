import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { subtotalDeItems } from "@/features/carrito/domain/carrito";
import { crearRepositorioCarrito } from "@/features/carrito/infrastructure/carritoRepository";
import { BarraCarrito } from "@/features/carrito/ui/BarraCarrito";
import type { TipoProducto } from "@/features/catalogo/domain/producto";
import { tipoProductoSchema } from "@/features/catalogo/domain/schemas";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { PestanasDisponibilidad } from "@/features/eventos/ui/PestanasDisponibilidad";
import { TarjetaDisponible } from "@/features/eventos/ui/TarjetaDisponible";
import { crearRepositorioExplorar } from "@/features/explorar/infrastructure/explorarRepository";
import { formatearMomento, horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
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
  searchParams: Promise<{ tab?: string }>;
};

export default async function AgregarDecoracionPage({ params, searchParams }: Props) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/eventos/${id}/agregar`);

  const supabase = await createClient();
  const eventos = crearRepositorioEventos(supabase);
  const evento = await eventos.obtener(id);
  if (!evento || evento.clienteId !== usuario.id) notFound();
  if (horasHasta(evento.fechaEntrega) <= 0) redirect(`/eventos/${evento.id}`);

  const activa = tipoProductoSchema.safeParse(tab).data ?? "inmediato";
  const [inmediatos, personalizables, itemsCarrito] = await Promise.all([
    eventos.productosDisponibles(evento.id, "inmediato"),
    eventos.productosDisponibles(evento.id, "personalizable"),
    crearRepositorioCarrito(supabase).listarItems(evento.id),
  ]);

  const productos = { inmediato: inmediatos, personalizable: personalizables }[activa];
  const enCarrito = itemsCarrito.reduce((total, item) => total + item.cantidad, 0);

  // Si no salió nada en ninguna pestaña, vemos si es porque nadie entrega en esa zona
  const sinResultados = inmediatos.length === 0 && personalizables.length === 0;
  const zonaSinCobertura =
    sinResultados && !(await crearRepositorioExplorar(supabase).hayEmprendimientosEnZona(evento.zona.id));

  return (
    <div className={`flex flex-col gap-5 ${enCarrito > 0 ? "pb-20" : ""}`}>
      <Link href={`/eventos/${evento.id}`} className="text-sm text-gris transition hover:text-tinta">
        ‹ {evento.nombre}
      </Link>

      <div>
        <h1 className="font-display text-3xl font-black">Agregar decoración</h1>
        <p className="text-sm text-gris">
          {formatearMomento(evento.fechaEntrega)} · {evento.zona.nombre}
        </p>
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
            rutaBase={`/eventos/${evento.id}/agregar`}
            activa={activa}
            conteos={{ inmediato: inmediatos.length, personalizable: personalizables.length }}
          />
          <p className="text-sm text-gris">{TEXTOS_PESTANA[activa].ayuda}</p>

          {productos.length === 0 ? (
            <p className="rounded-card border border-dashed border-borde bg-white px-6 py-10 text-center text-sm text-gris">
              {TEXTOS_PESTANA[activa].vacio}
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
        <BarraCarrito eventoId={evento.id} cantidad={enCarrito} subtotalCentavos={subtotalDeItems(itemsCarrito)} />
      )}
    </div>
  );
}
