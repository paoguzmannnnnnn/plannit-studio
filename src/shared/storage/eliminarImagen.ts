import type { ClienteSupabase } from "@/shared/supabase/tipos";
import type { Bucket } from "./reglasImagenes";

// Recibe la URL pública que guardamos en la BD y borra el archivo de Storage
export async function eliminarImagen(
  supabase: ClienteSupabase,
  bucket: Bucket,
  urlPublica: string,
): Promise<void> {
  const marcador = `/storage/v1/object/public/${bucket}/`;
  const inicio = urlPublica.indexOf(marcador);
  if (inicio === -1) return;

  const ruta = decodeURIComponent(urlPublica.slice(inicio + marcador.length));
  const { error } = await supabase.storage.from(bucket).remove([ruta]);
  if (error) throw error;
}
