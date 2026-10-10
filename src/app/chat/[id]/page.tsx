import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { conContexto, contraparteDe, referenciaDe } from "@/features/chat/domain/chat";
import { crearRepositorioChat } from "@/features/chat/infrastructure/chatRepository";
import { BarraContexto } from "@/features/chat/ui/BarraContexto";
import { FotoChat } from "@/features/chat/ui/FotoChat";
import { SalaChat } from "@/features/chat/ui/SalaChat";
import { obtenerMisPedidos } from "@/features/pedidos/application/pendientes";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

const MENSAJES_INICIALES = 100;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pedido?: string }>;
};

export default async function ConversacionPage({ params, searchParams }: Props) {
  const [{ id }, { pedido: pedidoSolicitado }] = await Promise.all([params, searchParams]);
  if (!esUuid(id)) notFound();

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/chat/${id}`);

  const chat = crearRepositorioChat(await createClient());
  const [encontrada, mensajes, misPedidos] = await Promise.all([
    chat.obtenerConversacion(id),
    chat.listarMensajes(id, MENSAJES_INICIALES),
    obtenerMisPedidos(),
  ]);
  if (!encontrada) notFound();

  const conversacion = conContexto(encontrada, misPedidos);
  const contraparte = contraparteDe(conversacion, usuario.rol);
  const seleccionado =
    conversacion.pedidos.find((pedido) => pedido.id === pedidoSolicitado) ?? conversacion.principal;

  // Se cita el pedido solo si llegaste desde él y todavía no se ha hablado de él
  const pedidoACitar =
    seleccionado && seleccionado.id === pedidoSolicitado && !mensajes.some((m) => m.pedidoId === seleccionado.id)
      ? seleccionado.id
      : null;

  const referencias = Object.fromEntries(conversacion.pedidos.map((pedido) => [pedido.id, referenciaDe(pedido)]));
  const perfilPublico = usuario.rol === "cliente" ? `/emprendimientos/${conversacion.emprendimiento.id}` : null;
  const cantidad = conversacion.pedidos.length;
  const subtitulo =
    cantidad === 0 ? "Consulta" : `${cantidad} ${cantidad === 1 ? "pedido" : "pedidos"} en común`;

  // Pantalla completa, como en una app: tapa la barra de navegación
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-fondo">
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-borde bg-white px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <Link href="/chat" aria-label="Volver a mensajes" className="pr-1 text-2xl leading-none text-gris">
            ‹
          </Link>
          <FotoChat nombre={contraparte.nombre} fotoUrl={seleccionado?.fotoUrl ?? contraparte.logoUrl} tamano={38} />
          <div className="min-w-0">
            {perfilPublico ? (
              <Link href={perfilPublico} className="block truncate font-bold transition hover:text-sandia">
                {contraparte.nombre}
              </Link>
            ) : (
              <p className="truncate font-bold">{contraparte.nombre}</p>
            )}
            <p className="text-[11px] text-gris">{subtitulo}</p>
          </div>
        </header>

        {seleccionado && (
          <BarraContexto
            conversacionId={conversacion.id}
            seleccionado={seleccionado}
            pedidos={conversacion.pedidos}
            rol={usuario.rol}
          />
        )}

        <SalaChat
          key={pedidoACitar ?? "sin-cita"}
          conversacionId={conversacion.id}
          usuarioId={usuario.id}
          iniciales={mensajes}
          referencias={referencias}
          pedidoACitar={pedidoACitar}
        />
      </div>
    </div>
  );
}
