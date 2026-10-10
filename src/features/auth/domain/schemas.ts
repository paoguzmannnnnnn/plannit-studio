import { z } from "zod";
import { ROLES } from "./roles";

export const registroSchema = z.object({
    nombre: z.string().trim().min(2, "Escribe tu nombre"),
    email: z.string().trim().email("Ese correo no es válido"),
    password: z.string().min(8, "La contraseña necesita mínimo 8 caracteres"),
    rol: z.enum(ROLES, { message: "Elige cómo vas a usar Plannit" }),
});

export const loginSchema = z.object({
    email: z.string().trim().email("Ese correo no es válido"),
    password: z.string().min(1, "Escribe tu contraseña"),
});
