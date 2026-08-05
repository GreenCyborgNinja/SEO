import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionId, recordEvent } from '@/lib/db/events'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const trackSchema = z.object({
  type: z.enum(['pageview', 'search']),
  path: z.string().max(512).optional(),
  product_id: z.string().max(32).optional(),
  category: z.string().max(64).optional(),
})

/**
 * Beacon endpoint for the client-side pageview tracker. Answers 204 as fast as
 * possible — the caller uses sendBeacon and never reads the response.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = trackSchema.safeParse(await request.json())
    if (!parsed.success) return new NextResponse(null, { status: 204 })

    const session = await auth()
    recordEvent({
      ...parsed.data,
      session_id: await getSessionId(),
      user_id: session?.user?.id ?? null,
    })
  } catch (error) {
    console.error('[track] ignored malformed beacon', error)
  }

  return new NextResponse(null, { status: 204 })
}
