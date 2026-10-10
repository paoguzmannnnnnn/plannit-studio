const ELEMENTOS = [
  { etiqueta: "Disponible", muestra: "border border-borde bg-white" },
  { etiqueta: "Bloqueado", muestra: "bg-sandia" },
] as const;

export function LeyendaCalendario() {
  return (
    <ul className="flex flex-wrap gap-4 text-xs text-gris">
      {ELEMENTOS.map((elemento) => (
        <li key={elemento.etiqueta} className="flex items-center gap-2">
          <span className={`size-4 rounded-md ${elemento.muestra}`} />
          {elemento.etiqueta}
        </li>
      ))}
    </ul>
  );
}
