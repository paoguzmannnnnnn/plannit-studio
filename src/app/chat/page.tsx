import { redirect } from "next/navigation";
import type { Rol } from "@/features/auth/domain/roles";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { conContexto } from "@/features/chat/domain/chat";
import { crearRepositorioChat } from "@/features/chat/infrastructure/chatRepository";
import { ListaConversaciones } from "@/features/chat/ui/ListaConversaciones";
import { obtenerMisPedidos } from "@/features/pedidos/application/pendientes";
import { createClient } from "@/shared/supabase/server";
import { EncabezadoPublico } from "../_componentes/EncabezadoPublico";

const SIN_CONVERSACIONES: Record<Rol, string> = {
  cliente: "Escríbele a un emprendimiento desde su página o desde uno de tus pedidos.",
  emprendedor: "Cuando un cliente te escriba, o le escribas desde un pedido, lo verás aquí.",
};

export default async function MensajesPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login?next=/chat");

  const [conversaciones, pedidos] = await Promise.all([
    crearRepositorioChat(await createClient()).listarConversaciones(usuario.id),
    obtenerMisPedidos(),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-6">
      <EncabezadoPublico usuario={usuario} />
      <h1 className="font-display text-3xl font-black">Mensajes</h1>

      {conversaciones.length === 0 ? (
        <p className="rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center text-sm text-gris">
          {SIN_CONVERSACIONES[usuario.rol]}
        </p>
      ) : (
        <ListaConversaciones
          conversaciones={conversaciones.map((conversacion) => conContexto(conversacion, pedidos))}
          rol={usuario.rol}
          usuarioId={usuario.id}
        />
      )}
    </div>
  );
}
