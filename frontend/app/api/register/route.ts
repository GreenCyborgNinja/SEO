import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/auth'
import { createUser, getUserByEmail } from '@/lib/db/users'
import { registerSchema } from '@/lib/validation/auth'
import { subscribe } from '@/lib/db/newsletter'
import { sendMail } from '@/lib/mail/mailer'
import { newsletterConfirmMail } from '@/lib/mail/templates'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Bitte prüfe deine Eingaben.' },
      { status: 400 }
    )
  }

  const { name, email, password, newsletter } = parsed.data

  if (await getUserByEmail(email)) {
    return NextResponse.json(
      { error: 'Für diese E-Mail-Adresse existiert bereits ein Konto. Melde dich stattdessen an.' },
      { status: 409 }
    )
  }

  const user = await createUser({
    name,
    email,
    password,
    newsletter,
    // Bootstrap: whoever registers with ADMIN_EMAIL owns the dashboard.
    role: isAdminEmail(email) ? 'admin' : 'user',
  })

  if (newsletter) {
    // Registration alone is not consent — the double-opt-in mail still goes out.
    try {
      const { token } = await subscribe(email, user.id)
      await sendMail(newsletterConfirmMail(email, token))
    } catch (error) {
      console.error('[register] newsletter opt-in failed', error)
    }
  }

  return NextResponse.json({ ok: true })
}
