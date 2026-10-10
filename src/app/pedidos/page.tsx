import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { agruparPorEtapa } from "@/features/pedidos/domain/pedido";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { ListaPorEtapas } from "@/features/pedidos/ui/ListaPorEtapas";
import { createClient } from "@/shared/supabase/server";

export default async function MisPedidosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login?next=/pedidos");

  const repositorio = crearRepositorioPedidos(await createClient());
  const [pedidos, transiciones] = await Promise.all([
    repositorio.listarDeCliente(usuario.id),
    repositorio.transiciones(),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl font-black">Mis pedidos</h1>
      {pedidos.length === 0 ? (
        <p className="rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center text-sm text-gris">
          Cuando confirmes una orden desde el carrito de tu evento, tus pedidos aparecen aquí.
        </p>
      ) : (
        <ListaPorEtapas
          grupos={agruparPorEtapa(pedidos, "cliente", transiciones)}
          rol="cliente"
          href={(pedido) => `/pedidos/${pedido.ordenId}`}
        />
      )}
    </>
  );
}
