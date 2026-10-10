import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { confirmarOrden, quitarDelCarrito } from "@/features/carrito/application/actions";
import { armarCarrito, type Disponibilidad } from "@/features/carrito/domain/carrito";
import { crearRepositorioCarrito } from "@/features/carrito/infrastructure/carritoRepository";
import { ConfirmarOrdenForm } from "@/features/carrito/ui/ConfirmarOrdenForm";
import { GrupoCarrito } from "@/features/carrito/ui/GrupoCarrito";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { formatearDolares } from "@/shared/dinero";
import { formatearMomento, horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

export default async function CarritoEventoPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/eventos/${id}/carrito`);

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(id);
  if (!evento || evento.clienteId !== usuario.id) notFound();

  const repositorio = crearRepositorioCarrito(supabase);
  const yaPaso = horasHasta(evento.fechaEntrega) <= 0;
  const [items, disponibilidad] = await Promise.all([
    repositorio.listarItems(evento.id),
    yaPaso ? Promise.resolve(new Map<string, Disponibilidad>()) : repositorio.disponibilidad(evento.id),
  ]);
  const carrito = armarCarrito(items, disponibilidad);

  const hayPersonalizables = carrito.grupos.some((grupo) => grupo.requiereAceptacion);

  return (
    <>
      <Link href={`/eventos/${evento.id}`} className="text-sm text-gris transition hover:text-tinta">
        ‹ {evento.nombre}
      </Link>

      <div>
        <h1 className="font-display text-3xl font-black">Tu carrito</h1>
        <p className="text-sm text-gris">
          {evento.nombre} · {formatearMomento(evento.fechaEntrega)} · {evento.zona.nombre}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center">
          <p className="font-display text-xl font-black">Todavía no hay nada aquí</p>
          <Link href={`/eventos/${evento.id}`} className="text-sm font-bold text-sandia">
            Ver lo que llega a tiempo ›
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="flex flex-col gap-4">
            {carrito.sinProducto.length > 0 && (
              <section className="flex flex-col gap-2 rounded-card bg-rosa p-4 text-sm">
                <p className="font-bold">
                  {carrito.sinProducto.length === 1
                    ? "Un producto ya no está disponible."
                    : `${carrito.sinProducto.length} productos ya no están disponibles.`}
                </p>
                <p>El emprendedor lo pausó. Quítalo para poder confirmar.</p>
                <ul className="flex flex-col gap-1">
                  {carrito.sinProducto.map((item) => (
                    <li key={item.id}>
                      <form action={quitarDelCarrito.bind(null, evento.id, item.id)}>
                        <BotonFormulario className="font-bold text-sandia">Quitar producto no disponible</BotonFormulario>
                      </form>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {carrito.grupos.map((grupo) => (
              <GrupoCarrito key={grupo.emprendimiento.id} grupo={grupo} eventoId={evento.id} />
            ))}
          </div>

          <aside className="flex flex-col gap-4 rounded-card border border-borde bg-white p-4 lg:sticky lg:top-6">
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-gris">
                <dt>Productos</dt>
                <dd>{formatearDolares(carrito.subtotalCentavos)}</dd>
              </div>
              <div className="flex justify-between text-gris">
                <dt>Envíos</dt>
                <dd>{carrito.envioCentavos === 0 ? "Gratis" : formatearDolares(carrito.envioCentavos)}</dd>
              </div>
              <div className="mt-1 flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd>{formatearDolares(carrito.totalCentavos)}</dd>
              </div>
            </dl>

            <p className="text-xs text-gris">
              Al confirmar apartamos tu fecha con cada emprendedor.
              {hayPersonalizables
                ? " Los pedidos a la medida se pagan cuando el emprendedor los acepte; los inmediatos, en seguida."
                : " Después tienes 30 minutos para pagar."}
            </p>

            <ConfirmarOrdenForm
              accion={confirmarOrden.bind(null, evento.id)}
              habilitado={carrito.puedeConfirmar}
              texto="Confirmar orden"
            />
            {!carrito.puedeConfirmar && !yaPaso && (
              <p className="text-xs text-sandia">Revisa los avisos de tu carrito para poder confirmar.</p>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
