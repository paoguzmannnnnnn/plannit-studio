import Image from "next/image";
import { formatearDolares } from "@/shared/dinero";
import {
  estadoDe,
  type Emprendimiento,
  type EstadoEmprendimiento,
} from "../domain/emprendimiento";

const PRESENTACION_ESTADO: Record<EstadoEmprendimiento, { etiqueta: string; clase: string }> = {
  en_revision: { etiqueta: "En revisión", clase: "bg-rosa text-sandia" },
  publicado: { etiqueta: "Publicado", clase: "bg-tinta text-fondo" },
};

function costoDeEnvio(centavos: number): string {
  return centavos === 0 ? "Gratis" : formatearDolares(centavos);
}

export function ResumenEmprendimiento({ emprendimiento }: { emprendimiento: Emprendimiento }) {
  const estado = estadoDe(emprendimiento);
  const { etiqueta, clase } = PRESENTACION_ESTADO[estado];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-card border border-borde bg-white p-4">
        {emprendimiento.logoUrl ? (
          <Image
            src={emprendimiento.logoUrl}
            alt={`Logo de ${emprendimiento.nombre}`}
            width={64}
            height={64}
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-rosa font-display text-2xl font-black text-sandia">
            {emprendimiento.nombre.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <p className="w-full truncate font-bold">{emprendimiento.nombre}</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${clase}`}>{etiqueta}</span>
        </div>
      </div>

      {estado === "en_revision" && (
        <p className="rounded-card bg-rosa p-4 text-sm">
          Estamos revisando tu emprendimiento. Mientras tanto puedes ir armando tu catálogo: se
          mostrará a los clientes en cuanto te aprobemos.
        </p>
      )}

      {emprendimiento.descripcion && (
        <p className="text-sm text-gris">{emprendimiento.descripcion}</p>
      )}

      <div>
        <h2 className="mb-2 text-sm font-bold">Zonas que cubres</h2>
        <ul className="flex flex-wrap gap-2">
          {emprendimiento.zonas.map((zona) => (
            <li
              key={zona.nombre}
              className="rounded-full border border-borde bg-white px-3 py-1.5 text-xs"
            >
              {zona.nombre} · {costoDeEnvio(zona.costoEnvioCentavos)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
