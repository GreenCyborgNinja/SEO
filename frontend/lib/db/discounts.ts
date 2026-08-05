import 'server-only'

import { and, asc, eq, or, isNull, gte, sql } from 'drizzle-orm'
import { db } from './client'
import { discountCodes, discountRedemptions, type DiscountCode } from './schema'

/**
 * Discount codes for members.
 *
 * We are an affiliate shop without our own checkout, so a code can never be
 * "applied" here — these are Amazon voucher/promo codes that members redeem at
 * Amazon, plus member-only deal access. The UI says so explicitly rather than
 * pretending to run a cart.
 */

export interface MemberCode extends DiscountCode {
  revealed: boolean
}

function activeCondition() {
  const today = new Date().toISOString().slice(0, 10)
  return and(
    eq(discountCodes.active, true),
    or(isNull(discountCodes.valid_until), gte(discountCodes.valid_until, today))
  )
}

/** Public codes — visible without an account, used as the login teaser. */
export async function getPublicCodes(): Promise<DiscountCode[]> {
  return db
    .select()
    .from(discountCodes)
    .where(and(activeCondition(), eq(discountCodes.audience, 'public')))
    .orderBy(asc(discountCodes.created_at))
    .all()
}

export async function countMemberCodes(): Promise<number> {
  const row = db
    .select({ count: sql<number>`count(*)` })
    .from(discountCodes)
    .where(and(activeCondition(), eq(discountCodes.audience, 'member')))
    .get()
  return row?.count ?? 0
}

/** All codes a logged-in user may see, flagged with whether they already revealed it. */
export async function getMemberCodes(userId: string): Promise<MemberCode[]> {
  const rows = db
    .select({
      code: discountCodes,
      revealed_at: discountRedemptions.revealed_at,
    })
    .from(discountCodes)
    .leftJoin(
      discountRedemptions,
      and(eq(discountRedemptions.code_id, discountCodes.id), eq(discountRedemptions.user_id, userId))
    )
    .where(activeCondition())
    .orderBy(asc(discountCodes.created_at))
    .all()

  return rows.map((row) => ({ ...row.code, revealed: row.revealed_at != null }))
}

/** Marks a code as revealed and returns it. Idempotent. */
export async function revealCode(userId: string, codeId: string): Promise<DiscountCode | null> {
  const code = db
    .select()
    .from(discountCodes)
    .where(and(eq(discountCodes.id, codeId), activeCondition()))
    .get()
  if (!code) return null

  db.insert(discountRedemptions)
    .values({ user_id: userId, code_id: codeId, revealed_at: new Date().toISOString() })
    .onConflictDoNothing()
    .run()

  return code
}
