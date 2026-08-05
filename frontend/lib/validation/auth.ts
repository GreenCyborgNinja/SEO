import { z } from 'zod'

/** German messages — they are rendered straight into the forms. */

export const credentialsSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
  password: z.string().min(1, 'Bitte gib dein Passwort ein.'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Bitte gib deinen Namen ein (mindestens 2 Zeichen).')
    .max(80, 'Der Name ist zu lang.'),
  email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
  password: z
    .string()
    .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
    .max(200, 'Das Passwort ist zu lang.'),
  newsletter: z.boolean().optional().default(false),
})

export const emailSchema = z.object({
  email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
})

export type RegisterInput = z.infer<typeof registerSchema>
