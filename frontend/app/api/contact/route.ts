import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'
import { sendMail } from '@/lib/mail/mailer'
import { contactNotificationMail } from '@/lib/mail/templates'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  name: z.string().trim().min(2, 'Bitte gib deinen Namen ein.').max(120),
  email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, 'Bitte schreibe mindestens 10 Zeichen.').max(5000),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  // Persist first: the message must not be lost if mail delivery is unavailable.
  db.insert(contactMessages)
    .values({ id: crypto.randomUUID(), ...parsed.data, created_at: new Date().toISOString() })
    .run()

  const recipient = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL
  if (recipient) {
    try {
      await sendMail(contactNotificationMail(recipient, parsed.data))
    } catch (error) {
      console.error('[contact] notification mail failed', error)
    }
  }

  return NextResponse.json({ ok: true })
}
