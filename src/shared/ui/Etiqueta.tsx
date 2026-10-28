// Sticker de estado: siempre con borde, para que se lea como etiqueta aunque esté sobre blanco
export type TonoEtiqueta = "sandia" | "suave" | "espera" | "neutro" | "punteado";

const CLASE: Record<TonoEtiqueta, string> = {
  sandia: "border-sandia bg-sandia text-white",
  suave: "border-sandia bg-rosa text-sandia",
  espera: "border-confeti bg-confeti/20 text-tinta",
  neutro: "border-gris/50 bg-borde text-gris",
  punteado: "border-dashed border-gris bg-white text-gris",
};

type Props = { tono: TonoEtiqueta; children: React.ReactNode; className?: string };

export function Etiqueta({ tono, children, className = "" }: Props) {
  return (
    <span
      className={`inline-block shrink-0 -rotate-2 whitespace-nowrap rounded-full border-[1.5px] px-2.5 py-0.5 text-[11px] font-bold ${CLASE[tono]} ${className}`}
    >
      {children}
    </span>
  );
}
