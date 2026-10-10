"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  estaActivo,
  NAVEGACION,
  RUTAS_SIN_NAVEGACION,
  type Audiencia,
  type ItemNavegacion,
} from "./navegacion";

function BotonPrincipal({ item }: { item: ItemNavegacion }) {
  const Icono = item.icono;
  return (
    <Link
      href={item.href}
      aria-label={item.etiqueta}
      className="-mt-7 flex size-14 items-center justify-center rounded-full border-4 border-fondo bg-sandia text-white transition hover:brightness-95"
    >
      <Icono size={26} strokeWidth={2.5} aria-hidden />
    </Link>
  );
}

function Pestana({ item, activa, pendientes }: { item: ItemNavegacion; activa: boolean; pendientes: number }) {
  const Icono = item.icono;
  const conAviso = item.muestraPendientes && pendientes > 0;

  return (
    <Link
      href={item.href}
      aria-current={activa ? "page" : undefined}
      aria-label={conAviso ? `${item.etiqueta}, ${pendientes} por atender` : undefined}
      className={`relative flex w-16 flex-col items-center gap-0.5 py-1 text-[11px] transition ${
        activa ? "font-bold text-sandia" : "text-gris hover:text-tinta"
      }`}
    >
      <Icono size={22} strokeWidth={activa ? 2.4 : 1.8} aria-hidden />
      {item.etiqueta}
      {conAviso && (
        <span
          aria-hidden
          className="absolute right-2.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-sandia px-1 text-[10px] font-bold text-white"
        >
          {pendientes > 9 ? "9+" : pendientes}
        </span>
      )}
    </Link>
  );
}

type Props = { audiencia: Audiencia; pendientes: number };

export function BarraNavegacion({ audiencia, pendientes }: Props) {
  const ruta = usePathname();
  if (RUTAS_SIN_NAVEGACION.includes(ruta)) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto w-[calc(100%-1.5rem)] max-w-md"
    >
      <ul className="flex items-center justify-around rounded-full border border-borde bg-white px-2 py-1.5">
        {NAVEGACION[audiencia].map((item) => (
          <li key={item.href} className="flex justify-center">
            {item.principal ? (
              <BotonPrincipal item={item} />
            ) : (
              <Pestana item={item} activa={estaActivo(ruta, item)} pendientes={pendientes} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
