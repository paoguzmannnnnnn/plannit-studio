import Image from "next/image";
import { formatearDia } from "@/shared/fechas";
import { responderResena } from "../application/actions";
import type { Resena } from "../domain/resena";
import { Estrellas } from "./Estrellas";
import { ResponderForm } from "./ResponderForm";

type Props = {
  resena: Resena;
  emprendimiento: string;
  /** El emprendedor ve el formulario si todavía no respondió */
  puedeResponder?: boolean;
};

export function TarjetaResena({ resena, emprendimiento, puedeResponder = false }: Props) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-borde bg-white p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rosa font-display font-black text-sandia">
            {resena.autor.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{resena.autor}</p>
            <p className="text-[11px] text-gris">{formatearDia(resena.creadaAt)}</p>
          </div>
        </div>
        <Estrellas valor={resena.estrellas} />
      </header>

      {resena.comentario && <p className="whitespace-pre-line text-sm">{resena.comentario}</p>}

      {resena.fotos.length > 0 && (
        <ul className="flex gap-2">
          {resena.fotos.map((url, indice) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="relative block size-20 overflow-hidden rounded-2xl bg-rosa"
              >
                <Image src={url} alt={`Foto ${indice + 1} de la reseña`} fill sizes="80px" className="object-cover" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {resena.respuesta ? (
        <div className="rounded-2xl bg-fondo px-3 py-2 text-sm">
          <p className="text-xs font-bold">Respuesta de {emprendimiento}</p>
          <p className="whitespace-pre-line">{resena.respuesta}</p>
        </div>
      ) : (
        puedeResponder && <ResponderForm accion={responderResena.bind(null, resena.id)} />
      )}
    </article>
  );
}
