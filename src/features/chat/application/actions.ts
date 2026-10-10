"use server";

import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { crearRepositorioPedidos } from "@/features/pedidos/infrastructure/pedidoRepository";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";
import { crearRepositorioChat } from "../infrastructure/chatRepository";

// El cliente le escribe a un emprendimiento desde su página (consulta general)
export async function escribirAEmprendimiento(emprendimientoId: string): Promise<void> {
  if (!esUuid(emprendimientoId)) return;

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect(`/login?next=/emprendimientos/${emprendimientoId}`);
  if (usuario.rol !== "cliente") return;

  const conversacionId = await crearRepositorioChat(await createClient()).buscarOCrear(
    usuario.id,
    emprendimientoId,
  );
  redirect(`/chat/${conversacionId}`);
}

// Cualquiera de las dos partes escribe sobre un pedido; el chat abre con ese pedido citado
export async function escribirSobrePedido(pedidoId: string): Promise<void> {
  if (!esUuid(pedidoId)) return;

  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");

  const supabase = await createClient();
  // RLS: solo lo ven el cliente del pedido y el dueño del emprendimiento
  const pedido = await crearRepositorioPedidos(supabase).obtener(pedidoId);
  if (!pedido) return;

  const conversacionId = await crearRepositorioChat(supabase).buscarOCrear(
    pedido.cliente.id,
    pedido.emprendimiento.id,
  );
  redirect(`/chat/${conversacionId}?pedido=${pedido.id}`);
}
