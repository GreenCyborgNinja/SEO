import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktiere uns bei Fragen, Feedback oder Kooperationsanfragen.',
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
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dein Name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="deine@email.de"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Betreff
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Worum geht es?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Nachricht
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Deine Nachricht an uns..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:brightness-110 transition font-medium"
            >
              Nachricht senden
            </button>
          </form>
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