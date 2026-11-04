import { CalendarClock, Sparkles, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

// Los tres apartados del plan del evento
export const VISTAS_PLAN = [
  { id: "planificacion", etiqueta: "Planificación", detalle: "Agenda y notas", Icono: CalendarClock },
  { id: "decoracion", etiqueta: "Decoración", detalle: "Lo que eliges", Icono: Sparkles },
  { id: "invitados", etiqueta: "Invitados", detalle: "Quién confirma", Icono: Users },
] as const satisfies readonly { id: string; etiqueta: string; detalle: string; Icono: LucideIcon }[];

export type VistaPlan = (typeof VISTAS_PLAN)[number]["id"];

export const VISTA_INICIAL: VistaPlan = "decoracion";

export function vistaDe(valor: unknown): VistaPlan {
  return VISTAS_PLAN.find((vista) => vista.id === valor)?.id ?? VISTA_INICIAL;
}

type Props = { eventoId: string; activa: VistaPlan; avisos?: Partial<Record<VistaPlan, number>> };

// Va justo debajo del nombre del evento: es la forma de moverse dentro del plan
export function PestanasPlan({ eventoId, activa, avisos = {} }: Props) {
  return (
    <nav
      className="sticky top-2 z-20 grid grid-cols-3 gap-1.5 rounded-card border border-borde bg-white p-1.5 shadow-sm"
      aria-label="Apartados del plan"
    >
      {VISTAS_PLAN.map(({ id, etiqueta, detalle, Icono }) => {
        const esActiva = id === activa;
        const aviso = avisos[id] ?? 0;
        return (
          <Link
            key={id}
            href={id === VISTA_INICIAL ? `/eventos/${eventoId}` : `/eventos/${eventoId}?vista=${id}`}
            scroll={false}
            aria-current={esActiva ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 rounded-2xl border-[1.5px] px-1 py-2.5 text-center transition ${
              esActiva ? "border-sandia bg-sandia text-white" : "border-borde bg-fondo text-tinta hover:border-sandia hover:bg-rosa"
            }`}
          >
            <Icono size={20} strokeWidth={2} aria-hidden className={esActiva ? "" : "text-sandia"} />
            <span className="text-[13px] font-bold leading-tight">{etiqueta}</span>
            <span className={`hidden text-[11px] sm:block ${esActiva ? "text-white/85" : "text-gris"}`}>{detalle}</span>
            {aviso > 0 && (
              <span
                className={`absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                  esActiva ? "bg-white text-sandia" : "bg-sandia text-white"
                }`}
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
