import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { obtenerNoLeidos } from "../application/noLeidos";

// Ícono de mensajes del encabezado, con el número de no leídos
export async function BotonChat() {
  const noLeidos = await obtenerNoLeidos();

  return (
    <Link
      href="/chat"
      aria-label={noLeidos > 0 ? `Mensajes, ${noLeidos} sin leer` : "Mensajes"}
      className="relative flex size-10 items-center justify-center rounded-full border border-borde bg-white transition hover:border-sandia"
    >
      <MessageCircle size={20} aria-hidden />
      {noLeidos > 0 && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sandia px-1 text-[10px] font-bold text-white"
        >
          {noLeidos > 9 ? "9+" : noLeidos}
        </span>
      )}
    </Link>
  );
}
