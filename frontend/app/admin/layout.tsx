import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, isAdminEmail } from '@/lib/auth'
import { getUserById } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

/**
 * Authorization boundary for the dashboard. Middleware already redirects
 * non-admins, but middleware is routing — the actual check has to happen here,
 * against the database, on every request.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?next=%2Fadmin')

  const user = await getUserById(session.user.id)
  const isAdmin = user?.role === 'admin' || isAdminEmail(user?.email)
  if (!isAdmin) redirect('/account')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Eigene First-Party-Analytics – keine externen Tracker, keine Cookies von Dritten.
          </p>
        </div>
        <nav className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 transition"
          >
            Übersicht
          </Link>
          <Link
            href="/admin/spend"
            className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 transition"
          >
            Werbekosten
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
