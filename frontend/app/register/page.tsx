import type { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Registrieren',
  description: 'Kostenloses Daily-Trends-Konto anlegen: Merkliste, Deal-Alerts und Member-Rabatte.',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary">Konto erstellen</h1>
      <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
        <li>✓ Merkliste über Geräte hinweg</li>
        <li>✓ Zugang zu Member-Rabattcodes</li>
        <li>✓ Persönliche Produktempfehlungen</li>
        <li>✓ Optionaler Deal-Newsletter</li>
      </ul>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Du hast schon ein Konto?{' '}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Zur Anmeldung
        </Link>
      </p>
    </div>
  )
}
