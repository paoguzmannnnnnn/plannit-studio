import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario";

const ESTILOS: Record<Variante, string> = {
  primario: "bg-sandia text-white hover:brightness-95",
  secundario: "border border-borde bg-white text-tinta hover:bg-fondo",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante };

export function Button({ variante = "primario", className = "", ...props }: Props) {
  return (
    <button
      className={`h-12 w-full rounded-full px-5 text-sm font-bold transition disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
      {...props}
    />
  );
}
