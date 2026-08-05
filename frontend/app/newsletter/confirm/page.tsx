import type { Metadata } from 'next'
import Link from 'next/link'
import { confirm } from '@/lib/db/newsletter'
import { sendMail } from '@/lib/mail/mailer'
import { newsletterWelcomeMail } from '@/lib/mail/templates'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: 'Newsletter bestätigen',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ConfirmPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  const result = token ? await confirm(token) : null

  if (result) {
    try {
      await sendMail(newsletterWelcomeMail(result.email, result.token))
    } catch (error) {
      console.error('[newsletter] welcome mail failed', error)
    }
  }

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      {result ? (
        <>
          <p className="text-5xl">🎉</p>
          <h1 className="text-3xl font-bold text-primary mt-4">Anmeldung bestätigt</h1>
          <p className="text-gray-600 mt-3">
            Danke! Du erhältst ab jetzt Deal-Alerts und Member-Rabatte an{' '}
            <strong>{result.email}</strong>.
          </p>
          <Link
            href="/deals"
            className="inline-block mt-8 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
          >
            Aktuelle Deals ansehen
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-primary">Bestätigung fehlgeschlagen</h1>
          <p className="text-gray-600 mt-3">
            Dieser Link ist ungültig oder abgelaufen. Melde dich einfach erneut an – wir senden dir
            dann einen frischen Bestätigungslink.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
          >
            Zur Startseite
          </Link>
        </>
      )}
    </div>
  )
}
