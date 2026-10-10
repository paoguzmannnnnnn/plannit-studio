import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { accionesPara } from "@/features/pedidos/domain/acciones";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { TarjetaPedido } from "@/features/pedidos/ui/TarjetaPedido";
import { formatearMomento } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

export default async function PedidoPanelPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const emprendimiento = await requerirEmprendimiento();
  const repositorio = crearRepositorioPedidos(await createClient());
  const [pedido, transiciones] = await Promise.all([repositorio.obtener(id), repositorio.transiciones()]);

  if (!pedido || pedido.emprendimiento.id !== emprendimiento.id) notFound();

  const entrega = [
    { etiqueta: "Evento", valor: pedido.evento.nombre },
    { etiqueta: "Entrega", valor: formatearMomento(pedido.fechaEntrega) },
    { etiqueta: "Zona", valor: pedido.evento.zona },
    { etiqueta: "Dirección", valor: pedido.evento.direccion },
  ];

  return (
    <>
      <Link href="/panel/pedidos" className="text-sm text-gris transition hover:text-tinta">
        ‹ Pedidos
      </Link>

      <h1 className="font-display text-3xl font-black">Pedido de {pedido.cliente.nombre}</h1>

      <dl className="grid grid-cols-2 gap-3 rounded-card border border-borde bg-white p-4 text-sm">
        {entrega.map((dato) => (
          <div key={dato.etiqueta} className={dato.etiqueta === "Dirección" ? "col-span-2" : ""}>
            <dt className="text-xs text-gris">{dato.etiqueta}</dt>
            <dd className="font-medium">{dato.valor}</dd>
          </div>
        ))}
      </dl>

      <TarjetaPedido
        pedido={pedido}
        rol="emprendedor"
        acciones={accionesPara(pedido, "emprendedor", transiciones)}
      />
    </>
  );
}
