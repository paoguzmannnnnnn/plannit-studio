import type { Color } from "../domain/colores";

type Props = { color: Color; activo: boolean; onClick: () => void; deshabilitado?: boolean };

// Chip tocable con su circulito de color
export function ChipColor({ color, activo, onClick, deshabilitado = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-pressed={activo}
      className={`flex items-center gap-2 rounded-full border-[1.5px] py-1.5 pl-1.5 pr-3 text-xs transition disabled:opacity-40 ${
        activo ? "border-sandia bg-rosa font-bold" : "border-borde bg-white hover:border-sandia"
      }`}
    >
      <span
        aria-hidden
        className="size-5 shrink-0 rounded-full border border-tinta/15"
        style={{ backgroundColor: color.hex }}
      />
      {color.nombre}
    </button>
  );
}
