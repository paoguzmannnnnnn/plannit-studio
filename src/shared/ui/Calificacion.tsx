type Props = { promedio: number; total: number; className?: string };

export function Calificacion({ promedio, total, className = "" }: Props) {
  if (total === 0) {
    return <span className={`text-xs text-gris ${className}`}>Nuevo en Plannit</span>;
  }

  return (
    <span className={`text-xs text-gris ${className}`}>
      <span className="text-sandia" aria-hidden>
        ★
      </span>{" "}
      <span className="sr-only">Calificación </span>
      {Number(promedio).toFixed(1)} ({total})
    </span>
  );
}
