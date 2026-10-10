import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { agruparPorEtapa } from "@/features/pedidos/domain/pedido";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { ListaPorEtapas } from "@/features/pedidos/ui/ListaPorEtapas";
import { createClient } from "@/shared/supabase/server";

export default async function PedidosPanelPage() {
  const emprendimiento = await requerirEmprendimiento();
  const repositorio = crearRepositorioPedidos(await createClient());
  const [pedidos, transiciones] = await Promise.all([
    repositorio.listarDeEmprendimiento(emprendimiento.id),
    repositorio.transiciones(),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl font-black">Pedidos</h1>
      {pedidos.length === 0 ? (
        <p className="rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center text-sm text-gris">
          Todavía no te llegan pedidos. Cuando un cliente confirme una orden con tus productos, la
          verás aquí.
        </p>
      ) : (
        <ListaPorEtapas
          grupos={agruparPorEtapa(pedidos, "emprendedor", transiciones)}
          rol="emprendedor"
          href={(pedido) => `/panel/pedidos/${pedido.id}`}
        />
      )}
    </>
  );
}
