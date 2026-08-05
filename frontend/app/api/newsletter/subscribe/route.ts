import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { subscribe } from '@/lib/db/newsletter'
import { sendMail } from '@/lib/mail/mailer'
import { newsletterConfirmMail } from '@/lib/mail/templates'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  email: z.string().trim().email(),
  source: z.string().trim().max(40).optional(),
})

/** Naive in-memory throttle. Enough for a single local instance. */
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

function rateLimited(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

const GENERIC_OK = 'Fast fertig! Bitte bestätige den Link in der E-Mail, die wir dir gerade geschickt haben.'

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'local'
  if (rateLimited(`${ip}:${parsed.data.email}`)) {
    return NextResponse.json(
      { error: 'Zu viele Versuche. Bitte probiere es in einigen Minuten erneut.' },
      { status: 429 }
    )
  }

  const session = await auth()
  const { result, token } = await subscribe(parsed.data.email, session?.user?.id ?? null)

  // Same response either way — the endpoint must not reveal whether an address
  // is already subscribed.
  if (result !== 'already-confirmed') {
    try {
      await sendMail(newsletterConfirmMail(parsed.data.email, token))
    } catch (error) {
      console.error('[newsletter] confirmation mail failed', error)
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_OK })
}
