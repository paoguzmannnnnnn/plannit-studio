import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { subtotalDeItems, type ItemCarrito } from "@/features/carrito/domain/carrito";
import { crearRepositorioCarrito } from "@/features/carrito/infrastructure/carritoRepository";
import { esPedidoVivo } from "@/features/eventos/domain/edicion";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { ResumenEvento } from "@/features/eventos/ui/ResumenEvento";
import { accionesPara } from "@/features/pedidos/domain/acciones";
import { estadoVisible, etapaDe } from "@/features/pedidos/domain/pedido";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { AvisoPedido } from "@/features/pedidos/ui/AvisoPedido";
import { cargarPlan } from "@/features/plan/application/cargarPlan";
import { resumirPresupuesto } from "@/features/plan/domain/presupuesto";
import { BarraPresupuesto } from "@/features/plan/ui/BarraPresupuesto";
import { PestanasPlan, vistaDe } from "@/features/plan/ui/PestanasPlan";
import { PlanEvento } from "@/features/plan/ui/PlanEvento";
import { crearRepositorioAgenda } from "@/features/planificacion/infrastructure/agendaRepository";
import { PlanificacionEvento } from "@/features/planificacion/ui/PlanificacionEvento";
import { crearRepositorioInvitados } from "@/features/invitados/infrastructure/invitadoRepository";
import { ListaInvitados } from "@/features/invitados/ui/ListaInvitados";
import { horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vista?: string }>;
};

// El evento es el plan, en tres apartados: Planificación (agenda y notas),
// Decoración (los pasos con lo elegido y sus fechas límite) e Invitados
export default async function EventoPage({ params, searchParams }: Props) {
  const [{ id }, { vista: vistaPedida }] = await Promise.all([params, searchParams]);
  if (!esUuid(id)) notFound();
  const vista = vistaDe(vistaPedida);

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/eventos/${id}`);

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(id);
  if (!evento || evento.clienteId !== usuario.id) notFound();

  const yaPaso = horasHasta(evento.fechaEntrega) <= 0;
  const pedidosRepo = crearRepositorioPedidos(supabase);
  const [pedidos, transiciones, itemsCarrito, momentos, invitados] = await Promise.all([
    pedidosRepo.listarDeEvento(evento.id),
    pedidosRepo.transiciones(),
    yaPaso ? Promise.resolve<ItemCarrito[]>([]) : crearRepositorioCarrito(supabase).listarItems(evento.id),
    vista === "planificacion" ? crearRepositorioAgenda(supabase).listar(evento.id) : Promise.resolve([]),
    // Siempre: la pestaña de Invitados muestra cuántos faltan por confirmar
    crearRepositorioInvitados(supabase).listar(evento.id),
  ]);

  // El plan también da el numerito de pasos pendientes en la pestaña de Decoración
  const plan = await cargarPlan({ supabase, evento, pedidos, itemsCarrito, yaPaso });
  const subtotalSinApartar = subtotalDeItems(itemsCarrito);
  const presupuesto = evento.presupuestoCentavos
    ? resumirPresupuesto({
        presupuestoCentavos: evento.presupuestoCentavos,
        pedidos,
        sinApartarCentavos: subtotalSinApartar,
      })
    : null;
  const pendientes = pedidos.filter((pedido) => etapaDe(pedido, "cliente", transiciones) === "por_atender");
  const pedidosVivos = pedidos.filter((pedido) => esPedidoVivo({ estado: estadoVisible(pedido) }));
  const quienesLlegan = [...new Set(pedidosVivos.map((pedido) => pedido.emprendimiento.nombre))];

  return (
    <>
      <Link href="/eventos" className="text-sm text-gris transition hover:text-tinta">
        ‹ Mis eventos
      </Link>

      <ResumenEvento evento={evento} />

      {yaPaso && <p className="rounded-card bg-rosa p-4 text-sm">Este evento ya pasó. Así quedó tu plan:</p>}

      <PestanasPlan
        eventoId={evento.id}
        activa={vista}
        avisos={
          yaPaso
            ? {}
            : {
                decoracion: plan.pendientes.length + pendientes.length,
                invitados: invitados.filter((invitado) => invitado.estado === "pendiente").length,
              }
        }
      />

      {vista === "decoracion" && pendientes.length > 0 && (
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

      {vista === "planificacion" && (
        <PlanificacionEvento
          eventoId={evento.id}
          fechaEntrega={evento.fechaEntrega}
          momentos={momentos}
          emprendimientos={quienesLlegan}
          notas={evento.notas}
          editable={!yaPaso}
        />
      )}

      {vista === "decoracion" && (
        <>
          <BarraPresupuesto resumen={presupuesto} hrefEditar={yaPaso ? null : `/eventos/${evento.id}/editar#presupuesto`} />
          <PlanEvento plan={plan} eventoId={evento.id} editable={!yaPaso} subtotalSinApartar={subtotalSinApartar} />
          {pedidos.length > 0 && (
            <Link href="/pedidos" className="self-center text-sm font-bold text-sandia">
              Ver pagos y detalle de pedidos ›
            </Link>
          )}
        </>
      )}

      {vista === "invitados" && <ListaInvitados eventoId={evento.id} invitados={invitados} editable={!yaPaso} />}
    </>
  );
}
