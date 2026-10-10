import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esRol } from "@/features/auth/domain/roles";
import { resolverAcceso } from "@/features/auth/domain/acceso";
import type { Database } from "./database.types";
import { env } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims verifica la firma del token. No agregar código entre createServerClient y esta línea.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // El rol del token solo decide a qué pantalla mandar al usuario (UX).
  // La seguridad real de los datos la hace RLS en la base de datos.
  const rolDelToken: unknown = claims?.user_metadata?.rol;
  const sesion = claims ? { rol: esRol(rolDelToken) ? rolDelToken : ("cliente" as const) } : null;

  const destino = resolverAcceso(request.nextUrl.pathname, sesion);
  if (!destino) return response;

  const url = request.nextUrl.clone();
  url.pathname = destino.pathname;
  url.search = destino.search ?? "";

  const redireccion = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
  return redireccion;
}
