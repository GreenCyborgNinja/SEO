import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden',
  description: 'Melde dich in deinem Daily-Trends-Konto an.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary">Anmelden</h1>
      <p className="text-gray-600 mt-2">
        Merkliste, Deal-Alerts und Member-Rabatte – mit einem kostenlosen Konto.
      </p>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-lg" />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-accent font-medium hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  )
}
