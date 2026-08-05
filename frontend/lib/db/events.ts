import 'server-only'

import { cookies } from 'next/headers'
import { db } from './client'
import { events } from './schema'

export const SESSION_COOKIE = 'dt_sid'

export interface EventInput {
  type: 'pageview' | 'click' | 'search'
  session_id: string
  product_id?: string | null
  category?: string | null
  path?: string | null
  src?: string | null
  user_id?: string | null
}

/**
 * Writes one analytics row. SQLite inserts are sub-millisecond, but a tracking
 * failure must never break a page or a redirect — hence the swallowed error.
 */
export function recordEvent(input: EventInput): void {
  try {
    db.insert(events)
      .values({
        type: input.type,
        session_id: input.session_id,
        product_id: input.product_id ?? null,
        category: input.category ?? null,
        path: input.path ?? null,
        src: input.src ?? null,
        user_id: input.user_id ?? null,
        created_at: new Date().toISOString(),
      })
      .run()
  } catch (error) {
    console.error('[analytics] failed to record event', error)
  }
}

/** Anonymous session id issued by middleware; absent only if cookies are blocked. */
export async function getSessionId(): Promise<string> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value ?? 'anonymous'
}
