import type { Database } from "@/shared/supabase/database.types";

export type Rol = Database["public"]["Enums"]["rol_usuario"];

export const ROLES = ["cliente", "emprendedor"] as const satisfies readonly Rol[];

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}
