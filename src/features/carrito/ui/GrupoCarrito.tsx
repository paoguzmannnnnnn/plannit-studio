import { formatearDolares } from "@/shared/dinero";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import type { GrupoCarrito as Grupo } from "../domain/carrito";
import { LineaCarrito } from "./LineaCarrito";

export function GrupoCarrito({ grupo, eventoId }: { grupo: Grupo; eventoId: string }) {
  return (
    <section className="rounded-card border border-borde bg-white px-4 pt-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">{grupo.emprendimiento.nombre}</h2>
        {grupo.requiereAceptacion && (
          <Etiqueta tono="espera">Espera su confirmación</Etiqueta>
        )}
      </header>

      <ul className="divide-y divide-borde">
        {grupo.lineas.map((linea) => (
          <LineaCarrito key={linea.id} linea={linea} eventoId={eventoId} />
        ))}
      </ul>

      <dl className="flex flex-col gap-1 border-t border-borde py-3 text-sm">
        <div className="flex justify-between text-gris">
          <dt>Envío</dt>
          <dd>{grupo.envioCentavos === 0 ? "Gratis" : formatearDolares(grupo.envioCentavos)}</dd>
        </div>
        <div className="flex justify-between font-bold">
          <dt>Total con {grupo.emprendimiento.nombre}</dt>
          <dd>{formatearDolares(grupo.subtotalCentavos + grupo.envioCentavos)}</dd>
        </div>
      </dl>
    </section>
  );
}
