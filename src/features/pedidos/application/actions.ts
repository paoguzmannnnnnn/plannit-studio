"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { texto, type EstadoAccion } from "@/shared/acciones";
import { mensajeDeNegocio } from "@/shared/supabase/errores";
import { createClient } from "@/shared/supabase/server";
import { definicionDe } from "../domain/acciones";
import type { EstadoPedido } from "../domain/estados";
import { siguientesEstados, totalDe } from "../domain/pedido";
import { obtenerPasarela } from "../infrastructure/pasarela";
import { crearRepositorioPedidos } from "../infrastructure/pedidoRepository";

const MOTIVO_MINIMO = 5;
const ERROR_GENERICO = "No pudimos actualizar el pedido. Intenta de nuevo.";

function revalidarPedidos() {
  revalidatePath("/pedidos", "layout");
  revalidatePath("/panel/pedidos", "layout");
  revalidatePath("/eventos", "layout");
}

export async function cambiarEstadoPedido(
  pedidoId: string,
  hacia: EstadoPedido,
  _estado: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const definicion = definicionDe(hacia);
  // El pago tiene su propio flujo (pasarela); aquí solo transiciones directas
  if (definicion?.ejecucion !== "transicion") return { error: "Acción no válida" };

  const motivo = texto(formData, "motivo").trim();
  if (definicion.requiereMotivo && motivo.length < MOTIVO_MINIMO) {
    return { error: "Cuéntale al cliente por qué, en pocas palabras" };
  }

  try {
    await crearRepositorioPedidos(await createClient()).cambiarEstado(pedidoId, hacia, motivo || undefined);
  } catch (error) {
    console.error("[pedidos:cambiarEstado]", error);
    return { error: mensajeDeNegocio(error) ?? ERROR_GENERICO };
  }

  revalidarPedidos();
  return {};
}

export async function pagarPedido(
  pedidoId: string,
  _estado: EstadoAccion,
  _formData: FormData,
): Promise<EstadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "cliente") return { error: "Solo el cliente puede pagar su pedido" };

  const repositorio = crearRepositorioPedidos(await createClient());
  const [pedido, transiciones] = await Promise.all([repositorio.obtener(pedidoId), repositorio.transiciones()]);

  if (!pedido || pedido.cliente.id !== usuario.id) return { error: "No encontramos este pedido" };
  if (!siguientesEstados(pedido, "cliente", transiciones).includes("pagado")) {
    return { error: "Este pedido ya no se puede pagar" };
  }

  const pago = await obtenerPasarela().cobrar({
    pedidoId: pedido.id,
    montoCentavos: totalDe(pedido),
    descripcion: `Plannit · ${pedido.emprendimiento.nombre}`,
  });
  if (!pago.ok) return { error: pago.motivo };

  try {
    await repositorio.cambiarEstado(pedido.id, "pagado");
  } catch (error) {
    console.error("[pedidos:pagar]", error);
    return { error: mensajeDeNegocio(error) ?? ERROR_GENERICO };
  }

  revalidarPedidos();
  return {};
}
