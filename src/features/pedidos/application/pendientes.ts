import { cache } from "react";
import type { Rol } from "@/features/auth/domain/roles";
import { obtenerUsuarioActual, type UsuarioActual } from "@/features/auth/infrastructure/sesion";
import { obtenerMiEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { createClient } from "@/shared/supabase/server";
import { etapaDe, type Pedido, type PedidoRepository } from "../domain/pedido";
import { crearRepositorioPedidos } from "../infrastructure/pedidoRepository";

// Cómo se cargan "mis pedidos" según el rol
const CARGAR_PEDIDOS: Record<Rol, (repositorio: PedidoRepository, usuario: UsuarioActual) => Promise<Pedido[]>> = {
  cliente: (repositorio, usuario) => repositorio.listarDeCliente(usuario.id),
  emprendedor: async (repositorio) => {
    const emprendimiento = await obtenerMiEmprendimiento();
    return emprendimiento ? repositorio.listarDeEmprendimiento(emprendimiento.id) : [];
  },
};

// Todos los pedidos del usuario actual (una sola consulta por request)
export const obtenerMisPedidos = cache(async (): Promise<Pedido[]> => {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return [];
  return CARGAR_PEDIDOS[usuario.rol](crearRepositorioPedidos(await createClient()), usuario);
});

// Pedidos en los que el usuario actual tiene algo que hacer
export const obtenerPendientes = cache(async (): Promise<Pedido[]> => {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return [];

  const [pedidos, transiciones] = await Promise.all([
    obtenerMisPedidos(),
    crearRepositorioPedidos(await createClient()).transiciones(),
  ]);

  return pedidos.filter((pedido) => etapaDe(pedido, usuario.rol, transiciones) === "por_atender");
});
