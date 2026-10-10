import type { Rol } from "./roles";

type Sesion = { rol: Rol } | null;
type Permiso = Rol | "autenticado";
type Regla = { prefijo: string; permitido: Permiso };
export type Redireccion = { pathname: string; search?: string };

// Agregar una ruta protegida = agregar una línea aquí
const REGLAS: readonly Regla[] = [
  { prefijo: "/panel", permitido: "emprendedor" },
  { prefijo: "/eventos", permitido: "cliente" },
  { prefijo: "/carrito", permitido: "cliente" },
  { prefijo: "/pedidos", permitido: "cliente" },
  { prefijo: "/chat", permitido: "autenticado" },
  { prefijo: "/perfil", permitido: "autenticado" },
];

const RUTAS_DE_AUTH: readonly string[] = ["/login", "/registro"];

export const INICIO_POR_ROL: Record<Rol, string> = {
  cliente: "/",
  emprendedor: "/panel",
};

function coincide(pathname: string, prefijo: string): boolean {
  return pathname === prefijo || pathname.startsWith(`${prefijo}/`);
}

export function resolverAcceso(pathname: string, sesion: Sesion): Redireccion | null {
  if (RUTAS_DE_AUTH.some((ruta) => coincide(pathname, ruta))) {
    return sesion ? { pathname: INICIO_POR_ROL[sesion.rol] } : null;
  }

  const regla = REGLAS.find((r) => coincide(pathname, r.prefijo));
  if (!regla) return null;

  if (!sesion) {
    return { pathname: "/login", search: `?next=${encodeURIComponent(pathname)}` };
  }

  const tienePermiso = regla.permitido === "autenticado" || regla.permitido === sesion.rol;
  return tienePermiso ? null : { pathname: INICIO_POR_ROL[sesion.rol] };
}

// Evita redirecciones abiertas: solo rutas internas como "/carrito", nunca "//otro-sitio.com"
export function rutaSegura(destino: unknown, respaldo: string): string {
  return typeof destino === "string" && destino.startsWith("/") && !destino.startsWith("//")
    ? destino
    : respaldo;
}
