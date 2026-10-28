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
import { cargarPlan } from "@/features/plan/application/cargarPlan";
import { PlanEvento } from "@/features/plan/ui/PlanEvento";
import { horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

// El evento es el plan: lo pendiente arriba, lo que ya tienes con fotos y lo que te falta con su fecha límite
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

  const plan = await cargarPlan({ supabase, evento, pedidos, itemsCarrito, yaPaso });
  const pendientes = pedidos.filter((pedido) => etapaDe(pedido, "cliente", transiciones) === "por_atender");

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

      {yaPaso && <p className="rounded-card bg-rosa p-4 text-sm">Este evento ya pasó. Así quedó tu plan:</p>}

      <PlanEvento
        plan={plan}
        eventoId={evento.id}
        editable={!yaPaso}
        subtotalSinApartar={subtotalDeItems(itemsCarrito)}
      />

      {pedidos.length > 0 && (
        <Link href="/pedidos" className="self-center text-sm font-bold text-sandia">
          Ver pagos y detalle de pedidos ›
        </Link>
      )}
    </>
  );
}
