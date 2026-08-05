import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { addFavourite, getFavouriteIds, removeFavourite } from '@/lib/db/favourites'
import { getProductById } from '@/lib/db/products'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({ product_id: z.string().trim().min(1).max(32) })

async function requireUser() {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function GET() {
  const userId = await requireUser()
  if (!userId) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  return NextResponse.json({ product_ids: await getFavouriteIds(userId) })
}

export async function POST(request: Request) {
  const userId = await requireUser()
  if (!userId) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  // Guard the foreign key so a stale client cannot 500 the endpoint.
  if (!(await getProductById(parsed.data.product_id))) {
    return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
  }

  await addFavourite(userId, parsed.data.product_id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const userId = await requireUser()
  if (!userId) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  await removeFavourite(userId, parsed.data.product_id)
  return NextResponse.json({ ok: true })
}
