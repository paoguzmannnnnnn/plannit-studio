import Link from "next/link";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { separarPorFecha } from "@/features/eventos/domain/evento";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { masElegidos, mejorCalificados } from "@/features/explorar/domain/destacados";
import { crearRepositorioExplorar } from "@/features/explorar/infrastructure/explorarRepository";
import { CarruselProductos } from "@/features/explorar/ui/CarruselProductos";
import { FiltroCategorias } from "@/features/explorar/ui/FiltroCategorias";
import { TarjetaEmprendimiento } from "@/features/explorar/ui/TarjetaEmprendimiento";
import { TarjetaProducto } from "@/features/explorar/ui/TarjetaProducto";
import { obtenerPendientes } from "@/features/pedidos/application/pendientes";
import { FilaPedido } from "@/features/pedidos/ui/FilaPedido";
import { listarCategorias } from "@/shared/catalogos";
import { formatearDia, tiempoRestante } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { Etiqueta } from "@/shared/ui/Etiqueta";
import { EncabezadoPublico } from "./_componentes/EncabezadoPublico";

const EVENTOS_EN_HOME = 3;
const PRODUCTOS_POR_CARRUSEL = 10;
const TODOS_LOS_PRODUCTOS = 200;

type Props = { searchParams: Promise<{ categoria?: string }> };

function leerCategoria(valor: string | undefined): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default async function Home({ searchParams }: Props) {
  const categoriaId = leerCategoria((await searchParams).categoria);
  const supabase = await createClient();
  const explorar = crearRepositorioExplorar(supabase);

  const [usuario, pendientes, todos, filtrados, estadisticas, emprendimientos, categorias] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerPendientes(),
    explorar.listarProductos({ limite: TODOS_LOS_PRODUCTOS }),
    categoriaId ? explorar.listarProductos({ categoriaId }) : Promise.resolve(null),
    explorar.estadisticasProductos(),
    explorar.listarEmprendimientos(),
    listarCategorias(supabase),
  ]);

  const productosDelGrid = filtrados ?? todos;
  const proximosEventos =
    usuario?.rol === "cliente"
      ? separarPorFecha(await crearRepositorioEventos(supabase).listarDe(usuario.id)).proximos.slice(
          0,
          EVENTOS_EN_HOME,
        )
      : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-6">
      <EncabezadoPublico usuario={usuario} />

      {usuario?.rol === "cliente" && pendientes.length > 0 && (
        <section className="-mb-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold">Necesitan tu atención</h2>
          <ul className="flex flex-col gap-2">
            {pendientes.map((pedido) => (
              <li key={pedido.id}>
                <FilaPedido pedido={pedido} rol="cliente" href={`/pedidos/${pedido.ordenId}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gris">
            {usuario ? `Hola, ${usuario.nombre}` : "Planea la decoración de tu evento, paso a paso"}
          </p>
          <h1 className="font-display text-4xl font-black sm:text-5xl">¿Qué celebramos?</h1>
        </div>

        {proximosEventos.length > 0 && (
          <ul className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {proximosEventos.map((evento) => (
              <li key={evento.id} className="shrink-0">
                <Link
                  href={`/eventos/${evento.id}`}
                  className="flex w-56 flex-col items-start gap-1 rounded-card border border-borde bg-white p-4 transition hover:border-sandia"
                >
                  <Etiqueta tono="suave">{tiempoRestante(evento.fechaEntrega)}</Etiqueta>
                  <span className="w-full truncate font-bold">{evento.nombre}</span>
                  <span className="text-xs text-gris">
                    {formatearDia(evento.fechaEntrega)} · Ver mi plan ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CarruselProductos
        titulo="Lo más elegido"
        detalle="Lo que más ponen en sus eventos"
        productos={masElegidos(todos, estadisticas, PRODUCTOS_POR_CARRUSEL)}
        estadisticas={estadisticas}
      />

      <CarruselProductos
        titulo="Mejor calificados"
        detalle="Con las mejores reseñas de quienes ya celebraron"
        productos={mejorCalificados(todos, estadisticas, PRODUCTOS_POR_CARRUSEL)}
        estadisticas={estadisticas}
      />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-black">Toda la decoración</h2>
        <FiltroCategorias categorias={categorias} activa={categoriaId} />

        {productosDelGrid.length === 0 ? (
          <p className="rounded-card border border-dashed border-borde bg-white px-6 py-10 text-center text-sm text-gris">
            Todavía no hay productos aquí. Prueba con otra categoría.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {productosDelGrid.map((producto) => (
              <li key={producto.id} className="flex">
                <TarjetaProducto producto={producto} estadisticas={estadisticas.get(producto.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {emprendimientos.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-display text-2xl font-black">Conoce a los emprendedores</h2>
            <p className="text-sm text-gris">Quienes hacen posible cada detalle</p>
          </div>
          <ul className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
            {emprendimientos.map((emprendimiento) => (
              <li key={emprendimiento.id} className="flex">
                <TarjetaEmprendimiento emprendimiento={emprendimiento} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
