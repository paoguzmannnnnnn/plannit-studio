import Image from "next/image";

type Props = { nombre: string; fotoUrl: string | null; tamano?: number };

// Foto de lo que se está cotizando; si no hay, la inicial en sandía
export function FotoChat({ nombre, fotoUrl, tamano = 48 }: Props) {
  const estilo = { width: tamano, height: tamano };
  return fotoUrl ? (
    <Image
      src={fotoUrl}
      alt=""
      width={tamano}
      height={tamano}
      style={estilo}
      className="shrink-0 rounded-2xl border border-borde object-cover"
    />
  ) : (
    <span
      style={{ ...estilo, fontSize: tamano * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-2xl bg-rosa font-display font-black text-sandia"
      aria-hidden
    >
      {nombre.charAt(0).toUpperCase()}
    </span>
  );
}
