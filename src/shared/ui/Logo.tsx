import Link from "next/link";

// "plannit." con el sticker "studio". El sticker se mide en em,
// así que escala solo con el tamaño de letra que le pongas al logo.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Plannit Studio, inicio"
      className={`relative inline-flex font-display font-black text-sandia ${className}`}
    >
      <span aria-hidden>
        plannit<span className="text-tinta">.</span>
      </span>
      <span
        aria-hidden
        className="absolute -bottom-[0.1em] -right-[0.45em] -rotate-6 rounded-full bg-tinta px-[0.6em] py-[0.15em] font-sans text-[0.26em] font-bold not-italic leading-none tracking-wide text-fondo"
      >
        studio
      </span>
    </Link>
  );
}
