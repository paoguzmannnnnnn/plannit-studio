const POSICIONES = [1, 2, 3, 4, 5] as const;

export function Estrellas({ valor, className = "text-sm" }: { valor: number; className?: string }) {
  return (
    <span role="img" aria-label={`${valor} de 5 estrellas`} className={`tracking-tight ${className}`}>
      {POSICIONES.map((posicion) => (
        <span key={posicion} aria-hidden className={posicion <= valor ? "text-sandia" : "text-borde"}>
          ★
        </span>
      ))}
    </span>
  );
}
