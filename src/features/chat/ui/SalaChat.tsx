"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validarImagen } from "@/shared/storage/reglasImagenes";
import { subirImagen } from "@/shared/storage/subirImagen";
import { createClient } from "@/shared/supabase/client";
import { validarContenido, type Mensaje } from "../domain/chat";
import { crearRepositorioChat } from "../infrastructure/chatRepository";
import { Burbuja } from "./Burbuja";
import { Compositor } from "./Compositor";
import { useMensajesEnVivo } from "./useMensajesEnVivo";

type Props = {
  conversacionId: string;
  usuarioId: string;
  iniciales: Mensaje[];
  /** Texto de cada pedido citado, por id ("Arco de globos · Cumple de Sofi") */
  referencias: Record<string, string>;
  /** Si se llegó desde un pedido, el primer mensaje lo cita */
  pedidoACitar: string | null;
};

export function SalaChat({ conversacionId, usuarioId, iniciales, referencias, pedidoACitar }: Props) {
  // El mismo repositorio que usa el servidor, pero con el cliente del navegador
  const supabase = useMemo(() => createClient(), []);
  const repositorio = useMemo(() => crearRepositorioChat(supabase), [supabase]);
  const [mensajes, setMensajes] = useState(iniciales);
  const [cita, setCita] = useState(pedidoACitar);
  const finRef = useRef<HTMLDivElement>(null);

  // Agrega un mensaje nuevo o reemplaza uno existente (llega el "leído")
  const integrar = useCallback((mensaje: Mensaje) => {
    setMensajes((anteriores) => {
      const indice = anteriores.findIndex((m) => m.id === mensaje.id);
      if (indice === -1) return [...anteriores, mensaje];
      const copia = [...anteriores];
      copia[indice] = mensaje;
      return copia;
    });
  }, []);

  useMensajesEnVivo(supabase, conversacionId, integrar);

  // Al abrir el chat (o al recibir algo) se marcan como leídos los mensajes del otro
  const hayNoLeidos = mensajes.some((m) => m.autorId !== usuarioId && !m.leidoAt);
  useEffect(() => {
    if (!hayNoLeidos) return;
    repositorio.marcarLeidos(conversacionId, usuarioId).catch((error) => console.error("[chat:leidos]", error));
  }, [hayNoLeidos, repositorio, conversacionId, usuarioId]);

  // Siempre mostrar el último mensaje
  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes.length]);

  async function enviar(texto: string, imagen: File | null): Promise<string | null> {
    const problema = validarContenido(texto, imagen !== null) ?? (imagen ? validarImagen(imagen, "chat") : null);
    if (problema) return problema;

    try {
      const imagenUrl = imagen ? await subirImagen(supabase, "chat", usuarioId, imagen) : null;
      const mensaje = await repositorio.enviar(conversacionId, usuarioId, {
        texto: texto.trim() || null,
        imagenUrl,
        pedidoId: cita,
      });
      integrar(mensaje);
      setCita(null); // la cita va solo en el primer mensaje
      return null;
    } catch (error) {
      console.error("[chat:enviar]", error);
      return "No se pudo enviar. Intenta de nuevo.";
    }
  }

  const ultimoPropio = [...mensajes].reverse().find((m) => m.autorId === usuarioId);
  const textoCita = cita ? referencias[cita] : null;

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {mensajes.length === 0 ? (
          <p className="mt-10 text-center text-sm text-gris">
            Escribe el primer mensaje. Puedes mandar fotos de referencia.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mensajes.map((mensaje) => (
              <Burbuja
                key={mensaje.id}
                mensaje={mensaje}
                propio={mensaje.autorId === usuarioId}
                visto={mensaje.id === ultimoPropio?.id && mensaje.leidoAt !== null}
                referencia={mensaje.pedidoId ? (referencias[mensaje.pedidoId] ?? null) : null}
              />
            ))}
          </ul>
        )}
        <div ref={finRef} />
      </div>

      <Compositor
        enviar={enviar}
        encabezado={
          textoCita && (
            <div className="flex items-center justify-between gap-2 rounded-xl border-l-[3px] border-sandia bg-fondo px-3 py-1.5 text-xs">
              <span className="min-w-0 truncate">
                <span className="font-bold">Sobre:</span> {textoCita}
              </span>
              <button type="button" onClick={() => setCita(null)} aria-label="No citar el pedido" className="shrink-0 text-base leading-none text-gris">
                ×
              </button>
            </div>
          )
        }
      />
    </>
  );
}
