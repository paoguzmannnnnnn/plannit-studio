// Precio de un producto según las opciones que eligió el cliente.
// La base de datos hace el mismo cálculo al apartar (_precio_item), así nadie puede manipularlo.
type ConPrecio = { precioCentavos: number };

export function precioConOpciones(
  precioBaseCentavos: number,
  tamano: ConPrecio | null,
  extras: readonly ConPrecio[],
): number {
  const base = tamano?.precioCentavos ?? precioBaseCentavos;
  return base + extras.reduce((total, extra) => total + extra.precioCentavos, 0);
}

export const MAX_TAMANOS = 6;
export const MAX_EXTRAS = 8;
