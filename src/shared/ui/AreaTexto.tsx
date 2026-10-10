import { useId, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export function AreaTexto({ label, className = "", ...props }: Props) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        className={`w-full min-w-0 rounded-2xl border border-borde bg-white px-4 py-3 text-base outline-none transition focus:border-sandia sm:text-sm ${className}`}
        {...props}
      />
    </div>
  );
}
