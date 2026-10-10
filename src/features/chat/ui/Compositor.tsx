"use client";

import { ImagePlus, SendHorizontal } from "lucide-react";
import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ACCEPT_IMAGENES } from "@/shared/storage/reglasImagenes";
import { MAX_CARACTERES_MENSAJE } from "../domain/chat";

type Props = {
  /** Devuelve un mensaje de error, o null si se envió */
  enviar: (texto: string, imagen: File | null) => Promise<string | null>;
  /** Algo que se muestra encima del campo (por ejemplo, el pedido que se va a citar) */
  encabezado?: ReactNode;
};

export function Compositor({ enviar, encabezado }: Props) {
  const [texto, setTexto] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  function elegirImagen(archivo: File | null) {
    setImagen(archivo);
    setVistaPrevia(archivo ? URL.createObjectURL(archivo) : null);
  }

  async function confirmar() {
    if (enviando) return;
    setEnviando(true);
    const problema = await enviar(texto, imagen);
    setEnviando(false);
    setError(problema);
    if (!problema) {
      setTexto("");
      elegirImagen(null);
    }
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void confirmar();
  }

  // Enter envía; Shift + Enter hace salto de línea
  function alTeclear(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      void confirmar();
    }
  }

  return (
    <form
      onSubmit={alEnviar}
      className="flex flex-col gap-2 border-t border-borde bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3"
    >
      {encabezado}
      {vistaPrevia && (
        <div className="relative size-20 overflow-hidden rounded-xl border border-borde">
          {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
          <img src={vistaPrevia} alt="Foto a enviar" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => elegirImagen(null)}
            aria-label="Quitar foto"
            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full border border-borde bg-white text-sm leading-none"
          >
            ×
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-sandia">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2">
        <label
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-borde text-gris transition hover:border-sandia hover:text-sandia has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia"
          aria-label="Adjuntar foto"
        >
          <ImagePlus size={20} aria-hidden />
          <input
            type="file"
            accept={ACCEPT_IMAGENES}
            className="sr-only"
            onChange={(evento) => {
              elegirImagen(evento.target.files?.[0] ?? null);
              evento.target.value = "";
            }}
          />
        </label>

        <textarea
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={alTeclear}
          rows={1}
          maxLength={MAX_CARACTERES_MENSAJE}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-borde bg-fondo px-4 py-2.5 text-base outline-none transition focus:border-sandia sm:text-sm"
        />

        <button
          disabled={enviando}
          aria-label="Enviar"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sandia text-white transition hover:brightness-95 disabled:opacity-50"
        >
          <SendHorizontal size={20} aria-hidden />
        </button>
      </div>
    </form>
  );
}
