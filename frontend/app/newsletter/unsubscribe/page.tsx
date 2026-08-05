import type { Metadata } from 'next'
import Link from 'next/link'
import { unsubscribe } from '@/lib/db/newsletter'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: 'Newsletter abbestellen',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams
  const email = token ? await unsubscribe(token) : null

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h1 className="text-3xl font-bold text-primary">
        {email ? 'Abmeldung bestätigt' : 'Link ungültig'}
      </h1>
      <p className="text-gray-600 mt-3">
        {email
          ? `${email} erhält keine weiteren Newsletter von uns. Schade – du kannst dich jederzeit wieder anmelden.`
          : 'Dieser Abmelde-Link ist ungültig oder wurde bereits verwendet.'}
      </p>
      <Link
        href="/"
        className="inline-block mt-8 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
      >
        Zur Startseite
      </Link>
    </div>
  )
}
