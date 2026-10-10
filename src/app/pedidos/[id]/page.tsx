import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { accionesPara } from "@/features/pedidos/domain/acciones";
import { totalDe } from "@/features/pedidos/domain/pedido";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { TarjetaPedido } from "@/features/pedidos/ui/TarjetaPedido";
import { formatearDolares } from "@/shared/dinero";
import { formatearMomento } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

// Una orden = todos los pedidos que se confirmaron juntos desde un carrito
export default async function OrdenPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/pedidos/${id}`);

  const repositorio = crearRepositorioPedidos(await createClient());
  const [pedidos, transiciones] = await Promise.all([repositorio.listarDeOrden(id), repositorio.transiciones()]);

  const primero = pedidos[0];
  if (!primero || primero.cliente.id !== usuario.id) notFound();

  const total = pedidos.reduce((suma, pedido) => suma + totalDe(pedido), 0);

  return (
    <>
      <Link href="/pedidos" className="text-sm text-gris transition hover:text-tinta">
        ‹ Mis pedidos
      </Link>

      <section className="flex flex-col items-start gap-1">
        <h1 className="font-display text-3xl font-black">{primero.evento.nombre}</h1>
        <p className="text-sm text-gris">
          {formatearMomento(primero.fechaEntrega)} · {primero.evento.zona}
        </p>
      </section>

      <ul className="flex flex-col gap-3">
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <TarjetaPedido pedido={pedido} rol="cliente" acciones={accionesPara(pedido, "cliente", transiciones)} />
          </li>
        ))}
      </ul>

      <div className="flex justify-between rounded-card bg-rosa p-4 font-bold">
        <span>Total de la orden</span>
        <span>{formatearDolares(total)}</span>
      </div>

      <Link
        href={`/eventos/${primero.evento.id}`}
        className="flex h-12 items-center justify-center rounded-full border border-borde bg-white text-sm font-bold transition hover:border-sandia"
      >
        Volver a mi evento
      </Link>
    </>
  );
}
