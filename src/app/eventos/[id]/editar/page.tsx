import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { actualizarEvento } from "@/features/eventos/application/actions";
import { fechaYZonaBloqueadas } from "@/features/eventos/domain/edicion";
import { MESES_MAXIMOS_HACIA_ADELANTE } from "@/features/eventos/domain/schemas";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { EventoForm } from "@/features/eventos/ui/EventoForm";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { listarZonas } from "@/shared/catalogos";
import { formatearMomento, horasHasta, hoyLocal, partesLocales, sumarDias } from "@/shared/fechas";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

export default async function EditarEventoPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/eventos/${id}/editar`);

  const supabase = await createClient();
  const evento = await crearRepositorioEventos(supabase).obtener(id);
  if (!evento || evento.clienteId !== usuario.id) notFound();
  if (horasHasta(evento.fechaEntrega) <= 0) redirect(`/eventos/${evento.id}`);

  const [zonas, pedidos] = await Promise.all([
    listarZonas(supabase),
    crearRepositorioPedidos(supabase).listarDeEvento(evento.id),
  ]);

  const bloqueada = fechaYZonaBloqueadas(pedidos);
  const { fecha, hora } = partesLocales(evento.fechaEntrega);
  const hoy = hoyLocal();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <Link href={`/eventos/${evento.id}`} className="text-sm text-gris transition hover:text-tinta">
          ‹ {evento.nombre}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">Editar evento</h1>
        {!bloqueada && (
          <p className="mt-1 text-sm text-gris">
            Si cambias la fecha o la zona, revisaremos tu carrito: lo que ya no llegue a tiempo se
            marcará para que lo quites.
          </p>
        )}
      </div>

      <EventoForm
        zonas={zonas}
        fechaMinima={hoy}
        fechaMaxima={sumarDias(hoy, MESES_MAXIMOS_HACIA_ADELANTE * 31)}
        accion={actualizarEvento.bind(null, evento.id)}
        textoBoton="Guardar cambios"
        valores={{
          nombre: evento.nombre,
          tipo: evento.tipo,
          fecha,
          hora,
          zonaId: evento.zona.id,
          direccion: evento.direccion,
        }}
        fechaBloqueada={
          bloqueada ? `${formatearMomento(evento.fechaEntrega)} · ${evento.zona.nombre}` : undefined
        }
      />
    </div>
  );
}
