import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktiere uns bei Fragen, Feedback oder Kooperationsanfragen.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">Kontakt</h1>
      
      <div className="max-w-2xl">
        <p className="text-lg text-gray-600 mb-8">
          Du hast Fragen, Feedback oder möchtest mit uns zusammenarbeiten? 
          Wir freuen uns von dir zu hören!
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <ContactForm />
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Alternative Kontaktmöglichkeiten</h2>
          <p className="text-gray-600">
            E-Mail: <a href="mailto:info@daily-trends.de" className="text-primary hover:underline">info@daily-trends.de</a>
          </p>
        </div>
      </div>
    </div>
  )
}