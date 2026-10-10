import type { Rol } from "@/features/auth/domain/roles";
import type { Etapa, Pedido } from "../domain/pedido";
import { FilaPedido } from "./FilaPedido";

const TITULOS: Record<Rol, Record<Etapa, string>> = {
  cliente: { por_atender: "Necesitan tu atención", en_espera: "En curso", historial: "Historial" },
  emprendedor: { por_atender: "Por atender", en_espera: "Esperando al cliente", historial: "Historial" },
};

const ORDEN: readonly Etapa[] = ["por_atender", "en_espera", "historial"];

type Props = {
  grupos: Record<Etapa, Pedido[]>;
  rol: Rol;
  href: (pedido: Pedido) => string;
};

export function ListaPorEtapas({ grupos, rol, href }: Props) {
  return (
    <>
      {ORDEN.filter((etapa) => grupos[etapa].length > 0).map((etapa) => (
        <section key={etapa} className="flex flex-col gap-3">
          <h2 className={`text-sm font-bold ${etapa === "historial" ? "text-gris" : ""}`}>
            {TITULOS[rol][etapa]} <span className="text-gris">({grupos[etapa].length})</span>
          </h2>
          <ul className={`flex flex-col gap-3 ${etapa === "historial" ? "opacity-70" : ""}`}>
            {grupos[etapa].map((pedido) => (
              <li key={pedido.id}>
                <FilaPedido pedido={pedido} rol={rol} href={href(pedido)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
