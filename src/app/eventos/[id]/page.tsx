import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { subtotalDeItems, type ItemCarrito } from "@/features/carrito/domain/carrito";
import { crearRepositorioCarrito } from "@/features/carrito/infrastructure/carritoRepository";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { ResumenEvento } from "@/features/eventos/ui/ResumenEvento";
import { accionesPara } from "@/features/pedidos/domain/acciones";
import { etapaDe } from "@/features/pedidos/domain/pedido";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { AvisoPedido } from "@/features/pedidos/ui/AvisoPedido";
import { FilaPedido } from "@/features/pedidos/ui/FilaPedido";
import { formatearDolares } from "@/shared/dinero";
import { horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

// El evento como centro de control: lo pendiente, lo que ya tengo y el acceso a agregar más
export default async function EventoPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/eventos/${id}`);

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(id);
  if (!evento || evento.clienteId !== usuario.id) notFound();

  const yaPaso = horasHasta(evento.fechaEntrega) <= 0;
  const pedidosRepo = crearRepositorioPedidos(supabase);
  const [pedidos, transiciones, itemsCarrito] = await Promise.all([
    pedidosRepo.listarDeEvento(evento.id),
    pedidosRepo.transiciones(),
    yaPaso ? Promise.resolve<ItemCarrito[]>([]) : crearRepositorioCarrito(supabase).listarItems(evento.id),
  ]);

  const pendientes = pedidos.filter((pedido) => etapaDe(pedido, "cliente", transiciones) === "por_atender");
  const enCarrito = itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  const sinNada = pedidos.length === 0 && enCarrito === 0;
  const rutaAgregar = `/eventos/${evento.id}/agregar`;

  return (
    <>
      <Link href="/eventos" className="text-sm text-gris transition hover:text-tinta">
        ‹ Mis eventos
      </Link>

      <ResumenEvento evento={evento} />

      {pendientes.length > 0 && (
        <section className="flex flex-col gap-3" aria-label="Necesitan tu atención">
          {pendientes.map((pedido) => (
            <AvisoPedido
              key={pedido.id}
              pedido={pedido}
              rol="cliente"
              acciones={accionesPara(pedido, "cliente", transiciones)}
              href={`/pedidos/${pedido.ordenId}`}
            />
          ))}
        </section>
      )}

      {sinNada ? (
        <section className="flex flex-col items-center gap-3 rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center">
          <p className="font-display text-2xl font-black">Todavía no eliges tu decoración</p>
          {yaPaso ? (
            <p className="text-sm text-gris">Este evento ya pasó.</p>
          ) : (
            <>
              <p className="max-w-sm text-sm text-gris">
                Te mostramos solo lo que llega a tiempo para tu fecha y tu zona.
              </p>
              <Link
                href={rutaAgregar}
                className="mt-2 flex h-12 items-center rounded-full bg-sandia px-6 text-sm font-bold text-white transition hover:brightness-95"
              >
                Elegir decoración
              </Link>
            </>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-black">Tu decoración</h2>

          <ul className="flex flex-col gap-3">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <FilaPedido
                  pedido={pedido}
                  rol="cliente"
                  href={`/pedidos/${pedido.ordenId}`}
                  mostrarEvento={false}
                />
              </li>
            ))}

            {enCarrito > 0 && (
              <li>
                <Link
                  href={`/eventos/${evento.id}/carrito`}
                  className="flex items-center justify-between gap-4 rounded-card border border-dashed border-sandia bg-white p-4 transition hover:bg-rosa"
                >
                  <div>
                    <p className="font-bold">En tu carrito</p>
                    <p className="text-xs text-gris">
                      {enCarrito} {enCarrito === 1 ? "producto" : "productos"} sin confirmar ·{" "}
                      {formatearDolares(subtotalDeItems(itemsCarrito))}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-sandia">Confirmar ›</span>
                </Link>
              </li>
            )}
          </ul>

          {yaPaso ? (
            <p className="text-sm text-gris">Este evento ya pasó.</p>
          ) : (
            <Link
              href={rutaAgregar}
              className="flex h-12 items-center justify-center rounded-full border border-borde bg-white text-sm font-bold transition hover:border-sandia"
            >
              + Agregar decoración
            </Link>
          )}
        </section>
      )}
    </>
  );
}
