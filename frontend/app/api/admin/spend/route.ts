import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, isAdminEmail } from '@/lib/auth'
import { getUserById } from '@/lib/db/users'
import { addSpend, deleteSpend } from '@/lib/db/analytics'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitte gib ein gültiges Datum an.'),
  channel: z.string().trim().min(2).max(40),
  amount_eur: z.number().finite().min(0).max(1_000_000),
  note: z.string().trim().max(200).optional(),
})

/** Same DB-backed role check as the admin pages — never trust the JWT alone. */
async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return false
  const user = await getUserById(session.user.id)
  return user?.role === 'admin' || isAdminEmail(user?.email)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' }, { status: 400 })
  }

  await addSpend(parsed.data)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const parsed = z.object({ id: z.string().min(1).max(64) }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  await deleteSpend(parsed.data.id)
  return NextResponse.json({ ok: true })
}
