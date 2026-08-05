import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { countMemberCodes } from '@/lib/db/discounts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()

  return NextResponse.json({
    logged_in: Boolean(session?.user?.id),
    name: session?.user?.name ?? null,
    member_codes: await countMemberCodes(),
  })
}
