import type { TarjetaProducto } from "./vistas";

export const MAX_BUSQUEDA = 60;

// "Globos Dorados" y "globos dorádos" se encuentran igual: sin mayúsculas ni tildes
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function leerBusqueda(valor: string | undefined): string {
  return (valor ?? "").trim().slice(0, MAX_BUSQUEDA);
}

// Coincide si TODAS las palabras aparecen en el nombre del producto o del emprendimiento
export function buscarProductos(productos: readonly TarjetaProducto[], busqueda: string): TarjetaProducto[] {
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [];
  return productos.filter((producto) => {
    const texto = normalizar(`${producto.nombre} ${producto.emprendimiento.nombre}`);
    return palabras.every((palabra) => texto.includes(palabra));
  });
}
