import {
  CalendarDays,
  CalendarHeart,
  House,
  LayoutGrid,
  LogIn,
  Plus,
  ReceiptText,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@/features/auth/domain/roles";

export type ItemNavegacion = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  /** Rutas en las que esta pestaña se marca como activa */
  activoEn: readonly string[];
  /** El botón central sandía (acción principal) */
  principal?: boolean;
  /** Muestra el numerito de pedidos que necesitan atención */
  muestraPendientes?: boolean;
};

export type Audiencia = Rol | "invitado";

const INICIO_CLIENTE: ItemNavegacion = {
  href: "/",
  etiqueta: "Inicio",
  icono: House,
  activoEn: ["/", "/emprendimientos", "/productos"],
};

const EVENTOS: ItemNavegacion = {
  href: "/eventos",
  etiqueta: "Eventos",
  icono: CalendarHeart,
  activoEn: ["/eventos"],
};

const CREAR_EVENTO: ItemNavegacion = {
  href: "/eventos/nuevo",
  etiqueta: "Crear evento",
  icono: Plus,
  activoEn: [],
  principal: true,
};

const PEDIDOS_CLIENTE: ItemNavegacion = {
  href: "/pedidos",
  etiqueta: "Pedidos",
  icono: ReceiptText,
  activoEn: ["/pedidos"],
  muestraPendientes: true,
};

// Una barra por audiencia: agregar o mover una pestaña es editar esta lista
export const NAVEGACION: Record<Audiencia, readonly ItemNavegacion[]> = {
  invitado: [
    INICIO_CLIENTE,
    EVENTOS,
    CREAR_EVENTO,
    PEDIDOS_CLIENTE,
    { href: "/login", etiqueta: "Entrar", icono: LogIn, activoEn: ["/login"] },
  ],
  cliente: [
    INICIO_CLIENTE,
    EVENTOS,
    CREAR_EVENTO,
    PEDIDOS_CLIENTE,
    { href: "/perfil", etiqueta: "Perfil", icono: User, activoEn: ["/perfil"] },
  ],
  emprendedor: [
    { href: "/panel", etiqueta: "Inicio", icono: House, activoEn: ["/panel$", "/panel/emprendimiento"] },
    {
      href: "/panel/pedidos",
      etiqueta: "Pedidos",
      icono: ReceiptText,
      activoEn: ["/panel/pedidos"],
      muestraPendientes: true,
    },
    {
      href: "/panel/catalogo/nuevo",
      etiqueta: "Nuevo producto",
      icono: Plus,
      activoEn: [],
      principal: true,
    },
    { href: "/panel/catalogo", etiqueta: "Catálogo", icono: LayoutGrid, activoEn: ["/panel/catalogo"] },
    { href: "/panel/calendario", etiqueta: "Calendario", icono: CalendarDays, activoEn: ["/panel/calendario"] },
  ],
};

// Pantallas donde no se muestra la barra
export const RUTAS_SIN_NAVEGACION: readonly string[] = ["/login", "/registro"];

// "/x" marca activo en /x y sus subrutas; "/x$" solo en /x exacto. "/" siempre es exacto.
export function estaActivo(ruta: string, item: ItemNavegacion): boolean {
  return item.activoEn.some((patron) => {
    if (patron.endsWith("$")) return ruta === patron.slice(0, -1);
    if (patron === "/") return ruta === "/";
    return ruta === patron || ruta.startsWith(`${patron}/`);
  });
}
