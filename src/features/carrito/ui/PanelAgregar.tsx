import Link from "next/link";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { ESTRATEGIAS_TIPO } from "@/features/catalogo/domain/tiposProducto";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import type { ProductoPublico } from "@/features/explorar/domain/vistas";
import { formatearDolares } from "@/shared/dinero";
import { formatearMomento, horasHasta } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { agregarAlCarrito } from "../application/actions";
import { cantidadEnCarrito } from "../domain/carrito";
import { crearRepositorioCarrito } from "../infrastructure/carritoRepository";
import { AgregarAlCarritoForm } from "./AgregarAlCarritoForm";

function Aviso({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card bg-rosa p-4 text-sm">{children}</div>;
}

// Bloque "Agregar a mi evento" de la página de producto (solo si se llega desde un evento propio)
export async function PanelAgregar({ producto, eventoId }: { producto: ProductoPublico; eventoId: string }) {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return null;

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(eventoId);
  if (!evento || evento.clienteId !== usuario.id || horasHasta(evento.fechaEntrega) <= 0) return null;

  const carrito = crearRepositorioCarrito(supabase);
  const [disponibilidad, items] = await Promise.all([
    carrito.disponibilidad(evento.id),
    carrito.listarItems(evento.id),
  ]);

  const hrefCarrito = `/eventos/${evento.id}/carrito`;
  const disponible = disponibilidad.get(producto.id);

  if (!disponible) {
    return (
      <Aviso>
        <p className="font-bold">No llega a tiempo para {evento.nombre}</p>
        <p className="mt-1">Revisa las opciones que sí están disponibles para tu fecha.</p>
      </Aviso>
    );
  }

  const maximo = disponible.disponibles - cantidadEnCarrito(items, producto.id);
  if (maximo <= 0) {
    return (
      <Aviso>
        <p className="font-bold">Ya tienes en tu carrito todo lo disponible para tu fecha.</p>
        <Link href={hrefCarrito} className="mt-2 inline-block font-bold text-sandia">
          Ver carrito ›
        </Link>
      </Aviso>
    );
  }

  const estrategia = ESTRATEGIAS_TIPO[producto.tipo];
  const envio =
    disponible.costoEnvioCentavos === 0
      ? "envío gratis"
      : `envío ${formatearDolares(disponible.costoEnvioCentavos)}`;

  return (
    <section className="flex flex-col gap-4 rounded-card border border-borde bg-white p-4">
      <div>
        <p className="font-bold">Agregar a {evento.nombre}</p>
        <p className="text-xs text-gris">
          {formatearMomento(evento.fechaEntrega)} · {envio}
        </p>
        {estrategia.requiereAceptacion && (
          <p className="mt-2 text-xs text-gris">
            Es un pedido a la medida: el emprendedor lo confirma antes de que pagues.
          </p>
        )}
      </div>
      <AgregarAlCarritoForm
        accion={agregarAlCarrito.bind(null, evento.id, producto.id)}
        maximo={maximo}
        precioCentavos={producto.precioCentavos}
        hrefCarrito={hrefCarrito}
        opciones={{
          colores: producto.permiteColores,
          texto: producto.permiteTexto,
          referencia: producto.permiteReferencia,
          notas: estrategia.admitePersonalizacion,
        }}
      />
    </section>
  );
}
