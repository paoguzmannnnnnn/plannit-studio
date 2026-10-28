import type { EstadisticasProducto, TarjetaProducto } from "./vistas";

type Estadisticas = ReadonlyMap<string, EstadisticasProducto>;

// Con menos reseñas que esto, el promedio no es confiable para "Mejor calificados"
const RESENAS_MINIMAS = 2;

const SIN_DATOS: EstadisticasProducto = { vecesElegido: 0, ratingPromedio: 0, totalResenas: 0 };

function de(estadisticas: Estadisticas, producto: TarjetaProducto): EstadisticasProducto {
  return estadisticas.get(producto.id) ?? SIN_DATOS;
}

export function masElegidos(
  productos: readonly TarjetaProducto[],
  estadisticas: Estadisticas,
  limite: number,
): TarjetaProducto[] {
  return productos
    .filter((producto) => de(estadisticas, producto).vecesElegido > 0)
    .sort((a, b) => de(estadisticas, b).vecesElegido - de(estadisticas, a).vecesElegido)
    .slice(0, limite);
}

export function mejorCalificados(
  productos: readonly TarjetaProducto[],
  estadisticas: Estadisticas,
  limite: number,
): TarjetaProducto[] {
  return productos
    .filter((producto) => de(estadisticas, producto).totalResenas >= RESENAS_MINIMAS)
    .sort((a, b) => {
      const ea = de(estadisticas, a);
      const eb = de(estadisticas, b);
      return eb.ratingPromedio - ea.ratingPromedio || eb.totalResenas - ea.totalResenas;
    })
    .slice(0, limite);
}
