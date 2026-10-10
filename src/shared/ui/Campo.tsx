import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

// text-base en celular: con menos de 16px el iPhone hace zoom al tocar el campo
export function Campo({ label, className = "", ...props }: Props) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`h-12 w-full min-w-0 rounded-2xl border border-borde bg-white px-4 text-base outline-none transition focus:border-sandia sm:text-sm ${className}`}
        {...props}
      />
    </div>
  );
}
