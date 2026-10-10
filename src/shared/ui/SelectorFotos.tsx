"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ACCEPT_IMAGENES, TAMANO_MAXIMO_MB, type Bucket } from "@/shared/storage/reglasImagenes";

type FotoElegida = { archivo: File; url: string };

type Props = {
  name: string;
  bucket: Bucket;
  /** Cuántas fotos más se pueden agregar ahora */
  disponibles: number;
  /** Máximo total permitido (para el mensaje cuando ya no caben más) */
  maximoTotal: number;
  titulo: string;
  ayuda?: string;
};

// Elegir varias fotos una por una, con vista previa y opción de quitar antes de enviar
export function SelectorFotos({ name, bucket, disponibles, maximoTotal, titulo, ayuda }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const elegidasRef = useRef<FotoElegida[]>([]);
  const [elegidas, setElegidas] = useState<FotoElegida[]>([]);
  const restantes = disponibles - elegidas.length;

  // El input del navegador reemplaza la selección en cada cambio.
  // Aquí le volvemos a cargar TODAS las fotos acumuladas para que viajen en el FormData.
  useEffect(() => {
    elegidasRef.current = elegidas;
    if (!inputRef.current) return;
    const transferencia = new DataTransfer();
    elegidas.forEach((foto) => transferencia.items.add(foto.archivo));
    inputRef.current.files = transferencia.files;
  }, [elegidas]);

  // Al desmontar, libera las URLs temporales de las vistas previas
  useEffect(() => {
    return () => elegidasRef.current.forEach((foto) => URL.revokeObjectURL(foto.url));
  }, []);

  function agregar(evento: ChangeEvent<HTMLInputElement>) {
    const nuevas = Array.from(evento.target.files ?? [])
      .filter((archivo) => !elegidas.some((foto) => foto.archivo === archivo))
      .slice(0, restantes)
      .map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }));
    setElegidas((anteriores) => [...anteriores, ...nuevas]);
  }

  function quitar(url: string) {
    URL.revokeObjectURL(url);
    setElegidas((anteriores) => anteriores.filter((foto) => foto.url !== url));
  }

  if (disponibles <= 0) {
    return (
      <p className="rounded-card bg-rosa p-4 text-sm">
        Ya tienes el máximo de {maximoTotal} fotos. Borra alguna para agregar otra.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{titulo}</p>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {elegidas.map((foto, indice) => (
          <li
            key={foto.url}
            className="relative aspect-square overflow-hidden rounded-2xl border border-borde bg-rosa"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
            <img src={foto.url} alt={`Foto nueva ${indice + 1}`} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => quitar(foto.url)}
              aria-label={`Quitar foto nueva ${indice + 1}`}
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full border border-borde bg-white text-base leading-none text-tinta transition hover:text-sandia"
            >
              ×
            </button>
          </li>
        ))}

        {restantes > 0 && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-borde bg-white text-center transition hover:border-sandia has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia">
              <span className="text-2xl leading-none text-sandia">+</span>
              <span className="px-1 text-[11px] text-gris">Agregar foto</span>
              <input type="file" multiple accept={ACCEPT_IMAGENES} onChange={agregar} className="sr-only" />
            </label>
          </li>
        )}
      </ul>

      {/* Input real que se envía con el formulario: siempre lleva todas las fotos acumuladas */}
      <input ref={inputRef} type="file" name={name} multiple className="hidden" tabIndex={-1} aria-hidden />

      <p className="text-xs text-gris">
        {elegidas.length === 0
          ? `Hasta ${disponibles} · JPG, PNG o WebP · máx. ${TAMANO_MAXIMO_MB[bucket]} MB cada una.${ayuda ? ` ${ayuda}` : ""}`
          : `${elegidas.length} de ${disponibles} · puedes agregar ${restantes} más`}
      </p>
    </div>
  );
}
