import 'server-only'

import { eq, sql } from 'drizzle-orm'
import { db } from './client'
import { users, type User } from './schema'
import { hashPassword } from '../auth/passwords'

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).get()
  return row ?? null
}

export async function getUserById(id: string): Promise<User | null> {
  const row = db.select().from(users).where(eq(users.id, id)).get()
  return row ?? null
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  newsletter?: boolean
  role?: string
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const now = new Date().toISOString()
  const row = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password_hash: await hashPassword(input.password),
    role: input.role ?? 'user',
    newsletter_opt_in: input.newsletter ?? false,
    emailVerified: null,
    image: null,
    created_at: now,
  }

  db.insert(users).values(row).run()
  return row as User
}

export async function setNewsletterOptIn(userId: string, optIn: boolean): Promise<void> {
  db.update(users).set({ newsletter_opt_in: optIn }).where(eq(users.id, userId)).run()
}

/** New customers in a date range — the denominator of the CAC formula. */
export async function countNewUsers(fromIso: string, toIso: string): Promise<number> {
  const row = db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`${users.created_at} >= ${fromIso} AND ${users.created_at} <= ${toIso}`)
    .get()
  return row?.count ?? 0
}
