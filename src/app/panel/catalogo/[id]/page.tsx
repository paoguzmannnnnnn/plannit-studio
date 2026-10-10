import Link from "next/link";
import { notFound } from "next/navigation";
import { actualizarProducto } from "@/features/catalogo/application/actions";
import { crearRepositorioProductos } from "@/features/catalogo/infrastructure/productoRepository";
import { GaleriaFotos } from "@/features/catalogo/ui/GaleriaFotos";
import { InterruptorActivo } from "@/features/catalogo/ui/InterruptorActivo";
import { ProductoForm } from "@/features/catalogo/ui/ProductoForm";
import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { listarCategorias } from "@/shared/catalogos";
import { createClient } from "@/shared/supabase/server";
import { esUuid } from "@/shared/validaciones";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  if (!esUuid(id)) notFound();

  const emprendimiento = await requerirEmprendimiento();
  const supabase = await createClient();
  const [producto, categorias] = await Promise.all([
    crearRepositorioProductos(supabase).obtener(id),
    listarCategorias(supabase),
  ]);

  if (!producto || producto.emprendimientoId !== emprendimiento.id) notFound();

  return (
    <>
      <div>
        <Link href="/panel/catalogo" className="text-sm text-gris transition hover:text-tinta">
          ‹ Volver al catálogo
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">{producto.nombre}</h1>
      </div>

      <InterruptorActivo producto={producto} />
      <GaleriaFotos producto={producto} />

      {/* La key cambia cuando cambian las fotos: así el selector de fotos nuevas se reinicia */}
      <ProductoForm
        key={producto.fotos.map((foto) => foto.id).join()}
        categorias={categorias}
        producto={producto}
        accion={actualizarProducto.bind(null, producto.id)}
        textoBoton="Guardar cambios"
      />
    </>
  );
}
