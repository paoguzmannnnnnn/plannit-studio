import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/infrastructure/sesion";
import { separarPorFecha } from "@/features/eventos/domain/evento";
import { crearRepositorioEventos } from "@/features/eventos/infrastructure/eventoRepository";
import { TarjetaEvento } from "@/features/eventos/ui/TarjetaEvento";
import { createClient } from "@/shared/supabase/server";

export default async function EventosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login?next=/eventos");

  const eventos = await crearRepositorioEventos(await createClient()).listarDe(usuario.id);
  const { proximos, pasados } = separarPorFecha(eventos);

  return (
    <>
      <h1 className="font-display text-3xl font-black">Mis eventos</h1>

      {proximos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-borde bg-white px-6 py-12 text-center">
          <p className="font-display text-xl font-black">¿Qué celebramos?</p>
          <p className="max-w-sm text-sm text-gris">
            Toca el <span className="font-bold text-sandia">+</span> de abajo para crear tu evento
            con la fecha y la zona, y te mostramos toda la decoración que llega a tiempo.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {proximos.map((evento) => (
            <li key={evento.id}>
              <TarjetaEvento evento={evento} />
            </li>
          ))}
        </ul>
      )}

      {pasados.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gris">Eventos pasados</h2>
          <ul className="flex flex-col gap-3">
            {pasados.map((evento) => (
              <li key={evento.id}>
                <TarjetaEvento evento={evento} pasado />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
