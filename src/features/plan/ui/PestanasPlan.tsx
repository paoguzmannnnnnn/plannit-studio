import Link from "next/link";

// Los tres apartados del plan del evento
export const VISTAS_PLAN = [
  { id: "planificacion", etiqueta: "Planificación" },
  { id: "decoracion", etiqueta: "Decoración" },
  { id: "invitados", etiqueta: "Invitados" },
] as const;

export type VistaPlan = (typeof VISTAS_PLAN)[number]["id"];

export const VISTA_INICIAL: VistaPlan = "decoracion";

export function vistaDe(valor: unknown): VistaPlan {
  return VISTAS_PLAN.find((vista) => vista.id === valor)?.id ?? VISTA_INICIAL;
}

type Props = { eventoId: string; activa: VistaPlan; avisos?: Partial<Record<VistaPlan, number>> };

export function PestanasPlan({ eventoId, activa, avisos = {} }: Props) {
  return (
    <nav className="sticky top-0 z-20 -mx-1 flex gap-1 rounded-full border border-borde bg-white p-1 shadow-sm" aria-label="Apartados del plan">
      {VISTAS_PLAN.map((vista) => {
        const esActiva = vista.id === activa;
        const aviso = avisos[vista.id] ?? 0;
        return (
          <Link
            key={vista.id}
            href={vista.id === VISTA_INICIAL ? `/eventos/${eventoId}` : `/eventos/${eventoId}?vista=${vista.id}`}
            scroll={false}
            aria-current={esActiva ? "page" : undefined}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm transition ${
              esActiva ? "bg-sandia font-bold text-white" : "text-gris hover:text-tinta"
            }`}
          >
            {vista.etiqueta}
            {aviso > 0 && (
              <span
                className={`rounded-full px-1.5 text-[11px] font-bold ${esActiva ? "bg-white text-sandia" : "bg-rosa text-sandia"}`}
                aria-label={`${aviso} pendientes`}
              >
                {aviso}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
