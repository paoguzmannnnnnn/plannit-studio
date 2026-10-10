"use client";

import { useState } from "react";
import type { Rol } from "@/features/auth/domain/roles";
import { coincideBusqueda, type ConversacionConContexto } from "../domain/chat";
import { FilaConversacion } from "./FilaConversacion";

type Filtro = "todos" | "no_leidos";

type Props = { conversaciones: ConversacionConContexto[]; rol: Rol; usuarioId: string };

export function ListaConversaciones({ conversaciones, rol, usuarioId }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const conNoLeidos = conversaciones.filter((c) => c.noLeidos > 0).length;
  const visibles = conversaciones.filter(
    (c) => (filtro === "todos" || c.noLeidos > 0) && coincideBusqueda(c, rol, busqueda),
  );

  const chip = (valor: Filtro, etiqueta: string) => (
    <button
      type="button"
      onClick={() => setFiltro(valor)}
      aria-pressed={filtro === valor}
      className={`rounded-full px-3 py-1.5 text-xs transition ${
        filtro === valor ? "bg-sandia font-bold text-white" : "border border-borde bg-white hover:border-sandia"
      }`}
    >
      {etiqueta}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        placeholder={rol === "cliente" ? "Buscar por emprendimiento o evento…" : "Buscar por cliente o evento…"}
        aria-label="Buscar conversaciones"
        className="h-11 w-full rounded-full border border-borde bg-white px-4 text-base outline-none transition focus:border-sandia sm:text-sm"
      />

      <div className="flex gap-2">
        {chip("todos", "Todos")}
        {chip("no_leidos", `No leídos${conNoLeidos > 0 ? ` · ${conNoLeidos}` : ""}`)}
      </div>

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-sm text-gris">
          {busqueda ? "No encontramos conversaciones con esa búsqueda." : "No tienes mensajes sin leer."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibles.map((conversacion) => (
            <li key={conversacion.id}>
              <FilaConversacion conversacion={conversacion} rol={rol} usuarioId={usuarioId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
