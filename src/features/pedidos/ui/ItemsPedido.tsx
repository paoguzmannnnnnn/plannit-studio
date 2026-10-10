import Image from "next/image";
import { describirPersonalizacion } from "@/features/carrito/domain/carrito";
import { formatearDolares } from "@/shared/dinero";
import { totalDe, type Pedido } from "../domain/pedido";

export function ItemsPedido({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <ul className="flex flex-col gap-3">
        {pedido.items.map((item) => {
          const { referenciaUrl, ...sinReferencia } = item.personalizacion;
          const detalles = describirPersonalizacion(sinReferencia);

          return (
            <li key={item.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-3">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="shrink-0">{formatearDolares(item.precioUnitarioCentavos * item.cantidad)}</span>
              </div>

              {detalles.length > 0 && (
                <ul className="flex flex-col gap-0.5 rounded-2xl bg-fondo px-3 py-2 text-xs text-gris">
                  {detalles.map((detalle) => (
                    <li key={detalle}>{detalle}</li>
                  ))}
                </ul>
              )}

              {referenciaUrl && (
                <a
                  href={referenciaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 self-start text-xs font-bold text-sandia"
                >
                  <span className="relative size-12 overflow-hidden rounded-xl bg-rosa">
                    <Image src={referenciaUrl} alt="Foto de referencia" fill sizes="48px" className="object-cover" />
                  </span>
                  Ver foto de referencia
                </a>
              )}
            </li>
          );
        })}
      </ul>

      <dl className="flex flex-col gap-1 border-t border-borde pt-3">
        <div className="flex justify-between text-gris">
          <dt>Envío</dt>
          <dd>{pedido.costoEnvioCentavos === 0 ? "Gratis" : formatearDolares(pedido.costoEnvioCentavos)}</dd>
        </div>
        <div className="flex justify-between font-bold">
          <dt>Total</dt>
          <dd>{formatearDolares(totalDe(pedido))}</dd>
        </div>
      </dl>
    </div>
  );
}
