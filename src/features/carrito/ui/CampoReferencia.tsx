"use client";

import { useEffect, useState } from "react";
import { ACCEPT_IMAGENES, TAMANO_MAXIMO_MB } from "@/shared/storage/reglasImagenes";

export function CampoReferencia() {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-borde bg-white p-3 transition hover:border-sandia has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sandia">
      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-rosa">
        {vistaPrevia ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
          <img src={vistaPrevia} alt="Vista previa de la referencia" className="size-full object-cover" />
        ) : (
          <span className="text-2xl leading-none text-sandia">+</span>
        )}
      </span>
      <span className="text-sm">
        <span className="block font-bold">Foto de referencia</span>
        <span className="text-xs text-gris">
          Opcional · una imagen de lo que te imaginas · máx. {TAMANO_MAXIMO_MB.referencias} MB
        </span>
      </span>
      <input
        type="file"
        name="referencia"
        accept={ACCEPT_IMAGENES}
        className="sr-only"
        onChange={(evento) => {
          const archivo = evento.target.files?.[0];
          setVistaPrevia(archivo ? URL.createObjectURL(archivo) : null);
        }}
      />
    </label>
  );
}
