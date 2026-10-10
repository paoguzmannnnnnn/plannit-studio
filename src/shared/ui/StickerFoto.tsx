// Etiqueta que va encima de una foto. Fondo sandía sólido con borde blanco:
// se lee igual sobre fotos claras, oscuras o de colores.
export function StickerFoto({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-1.25rem)] -rotate-3 truncate rounded-full border-2 border-white bg-sandia px-2.5 py-1 text-[11px] font-bold text-white">
      {children}
    </span>
  );
}
