import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz',
  description: 'Datenschutzerklärung von Daily Trends - Wie wir deine Daten schützen.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">Datenschutzerklärung</h1>
      
      <div className="prose max-w-none text-gray-600">
        <p className="text-lg mb-6">
          Diese Datenschutzerklärung informiert dich über die Art, den Umfang und den Zweck der Verarbeitung 
          deiner personenbezogenen Daten auf dieser Website.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Verantwortlicher</h2>
        <p className="mb-4">
          Daily Trends<br/>
          E-Mail: info@daily-trends.de
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Erfassung allgemeiner Informationen</h2>
        <p className="mb-4">
          Wenn du auf unsere Website zugiffst, werden automatisch allgemeine Informationen erfasst. 
          Diese Informationen (Server-Logfiles) beinhalten etwa den Browsertyp, das Betriebssystem, 
          die Domainnamen deines Internet-Service-Providers und ähnliches.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Cookies</h2>
        <p className="mb-4">
          Wir verwenden Cookies, um unsere Website nutzerfreundlicher zu gestalten. Cookies sind kleine Textdateien, 
          die auf deinem Computer gespeichert werden. Die meisten der von uns verwendeten Cookies sind so genannte 
          "Session-Cookies", die nach dem Besuch der Website automatisch gelöscht werden.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Google Analytics</h2>
        <p className="mb-4">
          Diese Website nutzt Google Analytics, einen Webanalysedienst der Google Inc. ("Google"). 
          Google Analytics verwendet sog. "Cookies", Textdateien, die auf deinem Computer gespeichert werden 
          und die eine Analyse der Benutzung der Website ermöglichen.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Amazon Partnerprogramm</h2>
        <p className="mb-4">
          Als Amazon-Partner verdienen wir an qualifizierten Käufen. Diese Website ist Teil des Amazon-Partnerprogramms, 
          das zur Bereitstellung eines Mediums für Websites konzipiert wurde, mittels dessen durch die Platzierung von 
          Werbeanzeigen und Links zu Amazon.de Werbekostenerstattung verdient werden kann.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Kontaktformular</h2>
        <p className="mb-4">
          Wenn du uns über das Kontaktformular kontaktierst, werden die von dir angegebenen Daten 
          (Name, E-Mail-Adresse, Nachricht) gespeichert, um deine Anfrage bearbeiten zu können.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Deine Rechte</h2>
        <p className="mb-4">
          Du hast das Recht, jederzeit Auskunft über deine bei uns gespeicherten personenbezogenen Daten zu erhalten. 
          Ebenso hast du das Recht auf Berichtigung, Sperrung oder Löschung deiner Daten.
        </p>
        
        <p className="mt-8 text-sm text-gray-500">
          Stand: Mai 2026
        </p>
      </div>
    </div>
  )
}