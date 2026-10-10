import { useId, type SelectHTMLAttributes } from "react";

type Opcion = { valor: string | number; etiqueta: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  opciones: readonly Opcion[];
  placeholder?: string;
};

export function Selector({ label, opciones, placeholder, className = "", ...props }: Props) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        className={`h-12 w-full min-w-0 rounded-2xl border border-borde bg-white px-4 text-base outline-none transition focus:border-sandia sm:text-sm ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}
