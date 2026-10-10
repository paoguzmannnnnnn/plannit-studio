"use client";

import { useEffect, useState } from "react";
import { ACCEPT_IMAGENES, TAMANO_MAXIMO_MB } from "@/shared/storage/reglasImagenes";

export function SelectorLogo({ actual = null }: { actual?: string | null }) {
  const [nuevo, setNuevo] = useState<string | null>(null);
  const vistaPrevia = nuevo ?? actual;

  // Libera la URL temporal de la vista previa cuando cambia o se desmonta
  useEffect(() => {
    return () => {
      if (nuevo) URL.revokeObjectURL(nuevo);
    };
  }, [nuevo]);

  return (
    <label className="flex cursor-pointer items-center gap-4">
      <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-borde bg-white">
        {vistaPrevia ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa (blob: o logo actual)
          <img src={vistaPrevia} alt="Vista previa del logo" className="size-full object-cover" />
        ) : (
          <span className="text-xs text-gris">Logo</span>
        )}
      </span>
      <span className="text-sm">
        <span className="block font-bold">{actual ? "Cambiar logo" : "Sube tu logo"}</span>
        <span className="text-xs text-gris">
          JPG, PNG o WebP · máx. {TAMANO_MAXIMO_MB.logos} MB · opcional
        </span>
      </span>
      <input
        type="file"
        name="logo"
        accept={ACCEPT_IMAGENES}
        className="sr-only"
        onChange={(evento) => {
          const archivo = evento.target.files?.[0];
          setNuevo(archivo ? URL.createObjectURL(archivo) : null);
        }}
      />
    </label>
  );
}
