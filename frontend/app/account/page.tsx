import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserById } from '@/lib/db/users'
import { getFavouriteProducts } from '@/lib/db/recommendations'
import { getMemberCodes } from '@/lib/db/discounts'
import { getSubscriptionStatus } from '@/lib/db/newsletter'
import ProductCard from '@/components/ProductCard'
import NewsletterForm from '@/components/NewsletterForm'
import DiscountCodeList from '@/components/DiscountCodeList'

export const metadata: Metadata = {
  title: 'Mein Konto',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const SUBSCRIPTION_LABEL: Record<string, string> = {
  confirmed: 'Aktiv – du erhältst Deal-Alerts.',
  pending: 'Bestätigung ausstehend – bitte klicke den Link in der E-Mail.',
  unsubscribed: 'Abgemeldet.',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?next=%2Faccount')

  const [user, favourites, codes] = await Promise.all([
    getUserById(session.user.id),
    getFavouriteProducts(session.user.id),
    getMemberCodes(session.user.id),
  ])
  const subscription = user ? await getSubscriptionStatus(user.email) : null

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-primary">Mein Konto</h1>
      <nav className="flex flex-wrap gap-2 mt-6 mb-10">
        {[
          { href: '#profil', label: 'Profil' },
          { href: '#merkliste', label: `Merkliste (${favourites.length})` },
          { href: '#newsletter', label: 'Newsletter' },
          { href: '#rabatte', label: `Rabatte (${codes.length})` },
        ].map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 transition"
          >
            {tab.label}
          </a>
        ))}
      </nav>

      <section id="profil" className="scroll-mt-24">
        <h2 className="text-xl font-bold text-primary mb-4">Profil</h2>
        <dl className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">{user?.name ?? '–'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">E-Mail</dt>
            <dd className="font-medium text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Mitglied seit</dt>
            <dd className="font-medium text-gray-900">
              {user ? new Date(user.created_at).toLocaleDateString('de-DE') : '–'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Rolle</dt>
            <dd className="font-medium text-gray-900">
              {user?.role === 'admin' ? (
                <>
                  Administrator ·{' '}
                  <Link href="/admin" className="text-accent hover:underline">
                    Dashboard
                  </Link>
                </>
              ) : (
                'Mitglied'
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section id="merkliste" className="mt-14 scroll-mt-24">
        <h2 className="text-xl font-bold text-primary mb-4">Merkliste</h2>
        {favourites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <p className="bg-white rounded-xl shadow-md p-6 text-gray-600 text-sm">
            Noch nichts gemerkt. Klicke bei einem Produkt auf das Herz-Symbol, um es hier zu sammeln.
          </p>
        )}
      </section>

      <section id="newsletter" className="mt-14 scroll-mt-24">
        <h2 className="text-xl font-bold text-primary mb-4">Newsletter</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">
            Status:{' '}
            <span className="font-medium text-gray-900">
              {subscription ? SUBSCRIPTION_LABEL[subscription] ?? subscription : 'Nicht angemeldet.'}
            </span>
          </p>
          {subscription !== 'confirmed' && (
            <div className="mt-4 max-w-sm bg-secondary rounded-xl p-4">
              <NewsletterForm source="account" defaultEmail={user?.email ?? ''} />
            </div>
          )}
        </div>
      </section>

      <section id="rabatte" className="mt-14 scroll-mt-24">
        <h2 className="text-xl font-bold text-primary mb-4">Meine Rabatte</h2>
        <DiscountCodeList codes={codes} />
      </section>
    </div>
  )
}
