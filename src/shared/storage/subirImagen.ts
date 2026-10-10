import type { ClienteSupabase } from "@/shared/supabase/tipos";
import { extensionDe, type Bucket } from "./reglasImagenes";

// Sube a <bucket>/<carpeta>/<uuid>.<ext> y devuelve la URL pública.
// La carpeta debe ser el id del usuario: así lo exigen las políticas de Storage.
export async function subirImagen(
  supabase: ClienteSupabase,
  bucket: Bucket,
  carpeta: string,
  archivo: File,
): Promise<string> {
  const ruta = `${carpeta}/${crypto.randomUUID()}.${extensionDe(archivo)}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(ruta, archivo, { contentType: archivo.type });

  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(ruta).data.publicUrl;
}
