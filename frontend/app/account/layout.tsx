import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Second line of defence: middleware already blocks /account, but middleware is
 * routing — not an authorization boundary. Every account page re-checks here.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?next=%2Faccount')

  return <>{children}</>
}
