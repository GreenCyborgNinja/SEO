import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { revealCode } from '@/lib/db/discounts'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({ code_id: z.string().trim().min(1).max(64) })

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Bitte melde dich an, um Member-Codes zu sehen.' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  const code = await revealCode(session.user.id, parsed.data.code_id)
  if (!code) return NextResponse.json({ error: 'Code nicht gefunden oder abgelaufen.' }, { status: 404 })

  return NextResponse.json({ code: code.code, title: code.title, value_label: code.value_label })
}
