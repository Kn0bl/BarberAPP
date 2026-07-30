import { z } from "zod";

const emailField = z
  .string()
  .min(1, "Ingresá tu email")
  .email("Ingresá un email válido");

const passwordField = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Ingresá tu nombre completo")
    .max(80, "Máximo 80 caracteres"),
  phone: z
    .string()
    .min(6, "Ingresá tu número de teléfono")
    .regex(/^[\d\s+()-]+$/, "Solo números y símbolos telefónicos"),
  email: emailField,
  password: passwordField,
});

export const profileSchema = z.object({
  fullName: z.string().min(3, "Ingresá tu nombre completo").max(80),
  phone: z.string().min(6, "Ingresá tu número de teléfono"),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const newPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
