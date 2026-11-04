import { X } from "lucide-react";
import { formatearFechaLarga, formatearHora, momentoLocal, partesLocales } from "@/shared/fechas";
import { BotonFormulario } from "@/shared/ui/BotonFormulario";
import { listaNatural } from "@/features/plan/domain/plan";
import { agregarMomento, guardarNotas, quitarMomento } from "../application/actions";
import { armarAgenda, type EntradaAgenda, type Momento } from "../domain/agenda";
import { FormMomento } from "./FormMomento";
import { NotasEvento } from "./NotasEvento";

type Props = {
  eventoId: string;
  fechaEntrega: string;
  momentos: readonly Momento[];
  /** Emprendimientos con pedido vivo: son los que llegan con la decoración */
  emprendimientos: readonly string[];
  notas: string | null;
  editable: boolean;
};

function Entrada({ entrada, fecha, eventoId, editable, ultima }: {
  entrada: EntradaAgenda;
  fecha: string;
  eventoId: string;
  editable: boolean;
  ultima: boolean;
}) {
  const hora = entrada.tipo === "momento" ? entrada.momento.hora : entrada.hora;
  const esDecoracion = entrada.tipo === "decoracion";

  return (
    <li className={`relative flex gap-3 ${ultima ? "" : "pb-5"}`}>
      {/* Línea del tiempo: une este punto con el siguiente */}
      {!ultima && <span aria-hidden className="absolute bottom-0 left-[calc(4.75rem+5.5px)] top-3 w-px bg-borde" />}
      <span className="w-16 shrink-0 pt-0.5 text-right text-xs font-bold text-gris">{formatearHora(momentoLocal(fecha, hora))}</span>
      <span
        aria-hidden
        className={`relative z-10 mt-1 size-3 shrink-0 rounded-full ${esDecoracion ? "bg-sandia" : "border-[1.5px] border-sandia bg-white"}`}
      />
      <div className={`min-w-0 flex-1 ${esDecoracion ? "rounded-2xl bg-rosa px-3 py-2" : ""}`}>
        {entrada.tipo === "decoracion" ? (
          <>
            <p className="text-sm font-bold">Decoración lista</p>
            <p className="text-xs">
              {entrada.emprendimientos.length > 0
                ? `Llegan ${listaNatural(entrada.emprendimientos)}`
                : "Cuando apartes tu decoración, aquí verás quién llega."}
            </p>
          </>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold">{entrada.momento.titulo}</p>
              {entrada.momento.nota && <p className="text-xs text-gris">{entrada.momento.nota}</p>}
            </div>
            {editable && (
              <form action={quitarMomento.bind(null, eventoId, entrada.momento.id)}>
                <BotonFormulario
                  aria-label={`Quitar ${entrada.momento.titulo}`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-gris transition hover:text-sandia"
                >
                  <X size={14} />
                </BotonFormulario>
              </form>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function PlanificacionEvento({ eventoId, fechaEntrega, momentos, emprendimientos, notas, editable }: Props) {
  const { fecha, hora } = partesLocales(fechaEntrega);
  const agenda = armarAgenda(momentos, { hora, emprendimientos });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-card border border-borde bg-white p-4">
        <div>
          <h2 className="font-display text-2xl font-black">Agenda del día</h2>
          <p className="text-xs text-gris first-letter:uppercase">{formatearFechaLarga(fecha)}</p>
        </div>

        <ol className="flex flex-col">
          {agenda.map((entrada, indice) => (
            <Entrada
              key={entrada.tipo === "momento" ? entrada.momento.id : "decoracion"}
              entrada={entrada}
              fecha={fecha}
              eventoId={eventoId}
              editable={editable}
              ultima={indice === agenda.length - 1}
            />
          ))}
        </ol>

        {editable && momentos.length === 0 && (
          <p className="text-xs text-gris">
            Anota lo importante del día: cuándo llegan los invitados, el pastel, las fotos, el brindis…
          </p>
        )}

        {editable && <FormMomento accion={agregarMomento.bind(null, eventoId)} />}
      </section>

      <NotasEvento notas={notas} editable={editable} accion={guardarNotas.bind(null, eventoId)} />
    </div>
  );
}
