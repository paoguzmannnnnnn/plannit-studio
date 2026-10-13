import Link from "next/link";

// "plannit." con el sticker "studio" a la derecha, sin taparse.
// Todo se mide en em: escala solo con el tamaño de letra que le pongas al logo.
// w-fit evita que se estire cuando el logo vive dentro de una columna (perfil, login).
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Plannit Studio, inicio"
      className={`inline-flex w-fit shrink-0 items-end font-display font-black text-sandia ${className}`}
    >
      <span aria-hidden>
        plannit<span className="text-tinta">.</span>
      </span>
      <span
        aria-hidden
        className="ml-[0.35em] translate-y-[0.35em] -rotate-6 rounded-full bg-tinta px-[0.6em] py-[0.25em] font-sans text-[0.28em] font-bold not-italic leading-none tracking-wide text-fondo"
      >
        studio
      </span>
    </Link>
  );
}
