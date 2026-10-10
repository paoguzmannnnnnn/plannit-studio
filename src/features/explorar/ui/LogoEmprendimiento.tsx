import Image from "next/image";
import type { EmprendimientoBreve } from "../domain/vistas";

type Props = { emprendimiento: Pick<EmprendimientoBreve, "nombre" | "logoUrl">; tamano: number };

// Logo redondo; si no hay logo, la inicial en sandía
export function LogoEmprendimiento({ emprendimiento, tamano }: Props) {
  const estilo = { width: tamano, height: tamano };

  return emprendimiento.logoUrl ? (
    <Image
      src={emprendimiento.logoUrl}
      alt={`Logo de ${emprendimiento.nombre}`}
      width={tamano}
      height={tamano}
      style={estilo}
      className="shrink-0 rounded-full border border-borde object-cover"
    />
  ) : (
    <span
      style={{ ...estilo, fontSize: tamano * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-rosa font-display font-black text-sandia"
      aria-hidden
    >
      {emprendimiento.nombre.charAt(0).toUpperCase()}
    </span>
  );
}
