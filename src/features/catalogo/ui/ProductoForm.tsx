"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { ESTADO_INICIAL, type EstadoAccion } from "@/shared/acciones";
import type { Categoria } from "@/shared/catalogos";
import { aMontoEditable } from "@/shared/dinero";
import { AreaTexto } from "@/shared/ui/AreaTexto";
import { Button } from "@/shared/ui/Button";
import { Campo } from "@/shared/ui/Campo";
import { Selector } from "@/shared/ui/Selector";
import { SelectorFotos } from "@/shared/ui/SelectorFotos";
import { MAX_COLORES_PRODUCTO } from "@/features/colores/domain/colores";
import { MAX_FOTOS_PRODUCTO, type Producto, type TipoProducto } from "../domain/producto";
import { ESTRATEGIAS_TIPO } from "../domain/tiposProducto";
import { CAMPOS_POR_TIPO } from "./camposPorTipo";
import { EditorOpciones } from "./EditorOpciones";
import { SelectorTipo } from "./SelectorTipo";

type Props = {
  categorias: readonly Categoria[];
  producto?: Producto;
  accion: (estado: EstadoAccion, formData: FormData) => Promise<EstadoAccion>;
  textoBoton: string;
};

export function ProductoForm({ categorias, producto, accion, textoBoton }: Props) {
  const [estado, ejecutar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const [tipo, setTipo] = useState<TipoProducto>(producto?.tipo ?? "inmediato");
  const [hayTamanos, setHayTamanos] = useState((producto?.tamanos.length ?? 0) > 0);
  const CamposDelTipo = CAMPOS_POR_TIPO[tipo];

  // Enviamos a mano para que el formulario NO se limpie si hay un error
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => ejecutar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <SelectorFotos
        name="fotos"
        bucket="productos"
        disponibles={MAX_FOTOS_PRODUCTO - (producto?.fotos.length ?? 0)}
        maximoTotal={MAX_FOTOS_PRODUCTO}
        titulo={producto ? "Agregar más fotos" : "Fotos del producto"}
        ayuda="La primera será la portada."
      />

      <Campo label="Nombre" name="nombre" maxLength={80} defaultValue={producto?.nombre} required />

      <div className="grid grid-cols-2 gap-3">
        <Selector
          label="Categoría"
          name="categoria"
          placeholder="Elige una"
          opciones={categorias.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
          defaultValue={producto?.categoriaId ?? ""}
          required
        />
        {hayTamanos ? (
          <p className="flex flex-col justify-end text-xs text-gris">El precio depende del tamaño que elija el cliente.</p>
        ) : (
          <Campo
            label="Precio ($)"
            name="precio"
            inputMode="decimal"
            placeholder="25.00"
            defaultValue={producto ? aMontoEditable(producto.precioCentavos) : ""}
            required
          />
        )}
      </div>

      <AreaTexto
        label="Descripción"
        name="descripcion"
        rows={3}
        maxLength={600}
        placeholder="Medidas, materiales, qué incluye…"
        defaultValue={producto?.descripcion ?? ""}
      />

      {producto ? (
        <p className="rounded-card border border-borde bg-white p-4 text-sm">
          <span className="font-bold">{ESTRATEGIAS_TIPO[producto.tipo].etiqueta}</span>
          <span className="text-gris"> · el tipo no se puede cambiar después de crear el producto</span>
        </p>
      ) : (
        <SelectorTipo valor={tipo} onCambio={setTipo} />
      )}

      <CamposDelTipo valores={producto} />

      <section className="flex flex-col gap-5 rounded-card border border-borde bg-white p-4">
        <h2 className="font-bold">Opciones para el cliente</h2>
        <Selector
          label="¿Cuántos colores puede elegir?"
          name="max_colores"
          defaultValue={producto?.maxColores ?? 0}
          opciones={Array.from({ length: MAX_COLORES_PRODUCTO + 1 }, (_, n) => ({
            valor: n,
            etiqueta: n === 0 ? "No elige colores" : `Hasta ${n} ${n === 1 ? "color" : "colores"} de tu paleta`,
          }))}
        />
        <EditorOpciones tipo="tamanos" iniciales={producto?.tamanos ?? []} onCambio={(n) => setHayTamanos(n > 0)} />
        <EditorOpciones tipo="extras" iniciales={producto?.extras ?? []} />
      </section>

      {estado.error && (
        <p role="alert" className="text-sm text-sandia">
          {estado.error}
        </p>
      )}
      {estado.mensaje && (
        <p role="status" className="rounded-card bg-rosa p-3 text-sm font-medium">
          {estado.mensaje}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : textoBoton}
      </Button>
    </form>
  );
}
