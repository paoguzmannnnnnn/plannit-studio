// Reglas de imágenes compartidas entre servidor y navegador.
// Deben coincidir con los límites de los buckets en Supabase.
export type Bucket = "logos" | "productos" | "referencias" | "resenas" | "chat";

export const TAMANO_MAXIMO_MB: Record<Bucket, number> = {
  logos: 2,
  productos: 5,
  referencias: 5,
  resenas: 5,
  chat: 5,
};

const EXTENSION_POR_TIPO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type TipoImagen = keyof typeof EXTENSION_POR_TIPO;

const TIPOS_IMAGEN = Object.keys(EXTENSION_POR_TIPO) as TipoImagen[];

export const ACCEPT_IMAGENES = TIPOS_IMAGEN.join(",");

function esTipoImagen(tipo: string): tipo is TipoImagen {
  return (TIPOS_IMAGEN as string[]).includes(tipo);
}

export function extensionDe(archivo: File): string {
  return esTipoImagen(archivo.type) ? EXTENSION_POR_TIPO[archivo.type] : "img";
}

export function validarImagen(archivo: File, bucket: Bucket): string | null {
  if (!esTipoImagen(archivo.type)) return "La imagen debe ser JPG, PNG o WebP";
  if (archivo.size > TAMANO_MAXIMO_MB[bucket] * 1024 * 1024) {
    return `La imagen debe pesar máximo ${TAMANO_MAXIMO_MB[bucket]} MB`;
  }
  return null;
}
