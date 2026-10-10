import Image from "next/image";
import Link from "next/link";
import { Calificacion } from "@/shared/ui/Calificacion";
import type { TarjetaEmprendimiento as Tarjeta } from "../domain/vistas";
import { LogoEmprendimiento } from "./LogoEmprendimiento";

export function TarjetaEmprendimiento({ emprendimiento }: { emprendimiento: Tarjeta }) {
  return (
    <Link
      href={`/emprendimientos/${emprendimiento.id}`}
      className="flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-borde bg-white transition hover:border-sandia"
    >
      <div className="grid h-24 grid-cols-3 gap-0.5 bg-rosa">
        {emprendimiento.fotos.map((url) => (
          <div key={url} className="relative">
            <Image src={url} alt="" fill sizes="90px" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3">
        <LogoEmprendimiento emprendimiento={emprendimiento} tamano={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{emprendimiento.nombre}</p>
          <Calificacion
            promedio={emprendimiento.ratingPromedio}
            total={emprendimiento.totalResenas}
          />
        </div>
      </div>
    </Link>
  );
}
