const MENSAJES: Readonly<Record<string, string>> = {
    invalid_credentials: "Correo o contraseña incorrectos",
    user_already_exists: "Ya existe una cuenta con ese correo",
    email_exists: "Ya existe una cuenta con ese correo",
    weak_password: "Esa contraseña es muy débil",
    email_not_confirmed: "Confirma tu correo antes de iniciar sesión",
    email_address_invalid: "Ese correo no es válido",
    email_address_not_authorized: "No pudimos enviar el correo de confirmación a esa dirección",
    over_email_send_rate_limit: "Demasiados intentos, espera un momento",
};

const MENSAJE_GENERICO = "Algo salió mal. Intenta de nuevo.";

export function mensajeErrorAuth(codigo: string | undefined): string {
    return (codigo && MENSAJES[codigo]) || MENSAJE_GENERICO;
}