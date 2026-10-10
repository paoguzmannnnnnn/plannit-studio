import Link from "next/link";
import { crearProducto } from "@/features/catalogo/application/actions";
import { ProductoForm } from "@/features/catalogo/ui/ProductoForm";
import { requerirEmprendimiento } from "@/features/emprendimientos/application/miEmprendimiento";
import { listarCategorias } from "@/shared/catalogos";
import { createClient } from "@/shared/supabase/server";

export default async function NuevoProductoPage() {
  await requerirEmprendimiento();
  const categorias = await listarCategorias(await createClient());

  return (
    <>
      <div>
        <Link href="/panel/catalogo" className="text-sm text-gris transition hover:text-tinta">
          ‹ Volver al catálogo
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">Nuevo producto</h1>
      </div>
      <ProductoForm categorias={categorias} accion={crearProducto} textoBoton="Publicar producto" />
    </>
  );
}
