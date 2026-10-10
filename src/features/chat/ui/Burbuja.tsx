import Image from "next/image";
import { formatearCuando } from "@/shared/fechas";
import type { Mensaje } from "../domain/chat";

type Props = { mensaje: Mensaje; propio: boolean; visto: boolean; referencia: string | null };

export function Burbuja({ mensaje, propio, visto, referencia }: Props) {
  return (
    <li className={`flex max-w-[80%] flex-col gap-0.5 ${propio ? "items-end self-end" : "items-start self-start"}`}>
      <div
        className={`flex flex-col gap-2 overflow-hidden rounded-2xl px-3 py-2 text-sm ${
          propio ? "rounded-br-md bg-sandia text-white" : "rounded-bl-md border border-borde bg-white"
        }`}
      >
        {referencia && (
          <p
            className={`rounded-lg border-l-[3px] px-2 py-1 text-[11px] ${
              propio ? "border-white bg-white/20" : "border-sandia bg-fondo"
            }`}
          >
            <span className="font-bold">Sobre:</span> {referencia}
          </p>
        )}
        {mensaje.imagenUrl && (
          <a
            href={mensaje.imagenUrl}
            target="_blank"
            rel="noreferrer"
            className="relative -mx-1 block aspect-square w-56 max-w-full overflow-hidden rounded-xl"
          >
            <Image src={mensaje.imagenUrl} alt="Foto enviada" fill sizes="224px" className="object-cover" />
          </a>
        )}
        {mensaje.texto && <p className="whitespace-pre-line break-words">{mensaje.texto}</p>}
      </div>
      <span className="px-1 text-[10px] text-gris">
        {formatearCuando(mensaje.creadoAt)}
        {visto && " · Visto"}
      </span>
    </li>
  );
}
