import 'server-only'

import { eq } from 'drizzle-orm'
import { db } from './client'
import { newsletterSubscribers, users } from './schema'

export type SubscribeResult = 'created' | 'resent' | 'already-confirmed'

/**
 * Double-opt-in subscribe. Always behaves the same from the outside so the
 * endpoint cannot be used to check whether an address is registered.
 */
export async function subscribe(
  email: string,
  userId: string | null = null
): Promise<{ result: SubscribeResult; token: string }> {
  const normalized = email.trim().toLowerCase()
  const existing = db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, normalized))
    .get()

  if (existing?.status === 'confirmed') {
    return { result: 'already-confirmed', token: existing.token }
  }

  const token = crypto.randomUUID()

  if (existing) {
    db.update(newsletterSubscribers)
      .set({ token, status: 'pending', unsubscribed_at: null, user_id: userId ?? existing.user_id })
      .where(eq(newsletterSubscribers.id, existing.id))
      .run()
    return { result: 'resent', token }
  }

  db.insert(newsletterSubscribers)
    .values({
      id: crypto.randomUUID(),
      email: normalized,
      status: 'pending',
      token,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
    .run()

  return { result: 'created', token }
}

export async function confirm(token: string): Promise<{ email: string; token: string } | null> {
  const row = db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.token, token)).get()
  if (!row) return null

  if (row.status !== 'confirmed') {
    db.update(newsletterSubscribers)
      .set({ status: 'confirmed', confirmed_at: new Date().toISOString(), unsubscribed_at: null })
      .where(eq(newsletterSubscribers.id, row.id))
      .run()

    if (row.user_id) {
      db.update(users).set({ newsletter_opt_in: true }).where(eq(users.id, row.user_id)).run()
    }
  }

  return { email: row.email, token: row.token }
}

export async function unsubscribe(token: string): Promise<string | null> {
  const row = db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.token, token)).get()
  if (!row) return null

  db.update(newsletterSubscribers)
    .set({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .where(eq(newsletterSubscribers.id, row.id))
    .run()

  if (row.user_id) {
    db.update(users).set({ newsletter_opt_in: false }).where(eq(users.id, row.user_id)).run()
  }

  return row.email
}

export async function getSubscriptionStatus(email: string): Promise<string | null> {
  const row = db
    .select({ status: newsletterSubscribers.status })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email.trim().toLowerCase()))
    .get()
  return row?.status ?? null
}
