import Image from "next/image";
import type { Producto } from "../domain/producto";
import { eliminarFoto } from "../application/actions";

export function GaleriaFotos({ producto }: { producto: Producto }) {
  const puedeBorrar = producto.fotos.length > 1;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-bold">Fotos</h2>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {producto.fotos.map((foto, indice) => (
          <li
            key={foto.id}
            className="relative aspect-square overflow-hidden rounded-2xl border border-borde bg-rosa"
          >
            <Image
              src={foto.url}
              alt={`${producto.nombre}, foto ${indice + 1}`}
              fill
              sizes="(max-width: 640px) 33vw, 130px"
              className="object-cover"
            />
            {indice === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full border-2 border-white bg-sandia px-2 py-0.5 text-[10px] font-bold text-white">
                Portada
              </span>
            )}
            {puedeBorrar && (
              <form action={eliminarFoto.bind(null, producto.id, foto.id)}>
                <button
                  aria-label={`Eliminar foto ${indice + 1}`}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full border border-borde bg-white text-base leading-none text-tinta transition hover:text-sandia"
                >
                  ×
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      {!puedeBorrar && (
        <p className="text-xs text-gris">Un producto necesita al menos una foto.</p>
      )}
    </section>
  );
}
