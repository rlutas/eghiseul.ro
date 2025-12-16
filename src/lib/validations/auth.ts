import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email-ul este obligatoriu')
    .email('Email invalid'),
  password: z
    .string()
    .min(1, 'Parola este obligatorie')
    .min(6, 'Parola trebuie să aibă cel puțin 6 caractere'),
})

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Prenumele este obligatoriu')
    .min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
  lastName: z
    .string()
    .min(1, 'Numele este obligatoriu')
    .min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  email: z
    .string()
    .min(1, 'Email-ul este obligatoriu')
    .email('Email invalid'),
  password: z
    .string()
    .min(1, 'Parola este obligatorie')
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
    .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
    .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmarea parolei este obligatorie'),
  terms: z
    .boolean()
    .refine(val => val === true, 'Trebuie să accepți termenii și condițiile'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email-ul este obligatoriu')
    .email('Email invalid'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Parola este obligatorie')
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
    .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
    .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmarea parolei este obligatorie'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
