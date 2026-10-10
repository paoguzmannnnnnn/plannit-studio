"use client";

import Image from "next/image";
import { useState } from "react";

export function GaleriaProducto({ fotos, nombre }: { fotos: readonly string[]; nombre: string }) {
  const [activa, setActiva] = useState(0);
  const principal = fotos[activa];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square overflow-hidden rounded-card bg-rosa">
        {principal && (
          <Image
            src={principal}
            alt={`${nombre}, foto ${activa + 1} de ${fotos.length}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        )}
      </div>

      {fotos.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto">
          {fotos.map((url, indice) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiva(indice)}
                aria-label={`Ver foto ${indice + 1}`}
                aria-pressed={indice === activa}
                className={`relative block size-16 overflow-hidden rounded-xl border-2 transition ${
                  indice === activa ? "border-sandia" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
