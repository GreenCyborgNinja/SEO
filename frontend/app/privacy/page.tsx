import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datenschutz',
  description: 'Datenschutzerklärung von Daily Trends – welche Daten wir verarbeiten und warum.',
  alternates: { canonical: '/privacy' },
}

/**
 * Kept in sync with what the code actually does. Notably: the old version
 * claimed Google Analytics was in use — we now run our own first-party
 * measurement instead and send no data to third parties.
 */
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">Datenschutzerklärung</h1>

      <div className="prose max-w-none text-gray-600">
        <p className="text-lg mb-6">
          Diese Datenschutzerklärung informiert dich über Art, Umfang und Zweck der Verarbeitung
          deiner personenbezogenen Daten auf dieser Website.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Verantwortlicher</h2>
        <p className="mb-4">
          Daily Trends
          <br />
          E-Mail: info@daily-trends.de
          <br />
          Vollständige Angaben im <Link href="/impressum" className="text-accent hover:underline">Impressum</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Server-Logfiles</h2>
        <p className="mb-4">
          Beim Zugriff auf diese Website werden automatisch allgemeine Informationen erfasst
          (Browsertyp, Betriebssystem, Zeitpunkt des Zugriffs). Diese Daten sind technisch notwendig
          für den Betrieb und lassen keine Rückschlüsse auf deine Person zu.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
          3. Reichweitenmessung – ohne externe Dienste
        </h2>
        <p className="mb-4">
          Wir setzen <strong>kein Google Analytics</strong> und keine anderen externen
          Tracking-Dienste ein. Stattdessen messen wir selbst und ausschließlich auf unserem eigenen
          Server, welche Seiten aufgerufen und welche Produktlinks angeklickt werden. Dabei
          speichern wir pro Ereignis: Zeitpunkt, aufgerufene Seite bzw. Produkt, die Platzierung des
          angeklickten Links und eine zufällige Sitzungskennung.
        </p>
        <p className="mb-4">
          Diese Sitzungskennung liegt im Cookie <code>dt_sid</code> (zufällige ID, keine
          personenbezogenen Daten, Laufzeit 180 Tage). Sie dient dazu, Seitenaufrufe und Klicks
          derselben Sitzung zuzuordnen – daraus entstehen unsere Klickrate und die Funktion
          „Kunden sahen auch an“. Es werden keine Daten an Dritte übermittelt und keine Profile über
          verschiedene Websites hinweg gebildet.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Cookies im Einzelnen</h2>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>
            <code>dt_sid</code> – Sitzungskennung für die eigene Reichweitenmessung (siehe Punkt 3).
          </li>
          <li>
            <code>authjs.session-token</code> – nur nach Anmeldung: hält dich eingeloggt. Wird beim
            Abmelden gelöscht.
          </li>
          <li>
            <code>authjs.csrf-token</code> – Schutz vor Cross-Site-Request-Forgery bei der Anmeldung.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Amazon-Partnerprogramm</h2>
        <p className="mb-4">
          Als Amazon-Partner verdienen wir an qualifizierten Käufen. Alle Produktlinks sind
          Affiliate-Links: Sie führen zunächst über eine eigene Weiterleitung (<code>/go/…</code>),
          in der wir den Klick zählen, und dann zu Amazon. An die Ziel-URL wird unsere Partner-Kennung
          angehängt, damit Amazon den Kauf uns zuordnen kann. Welche Daten Amazon anschließend
          verarbeitet, richtet sich nach der Datenschutzerklärung von Amazon.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Kundenkonto und Merkliste</h2>
        <p className="mb-4">
          Für ein Konto speichern wir Name, E-Mail-Adresse und dein Passwort ausschließlich als
          nicht rückrechenbaren Hash (bcrypt). Gemerkte Produkte und aufgedeckte Rabattcodes werden
          deinem Konto zugeordnet, damit sie auf allen Geräten verfügbar sind. Du kannst dein Konto
          jederzeit löschen lassen – schreib uns dazu einfach.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Newsletter (Double-Opt-in)</h2>
        <p className="mb-4">
          Für den Newsletter speichern wir deine E-Mail-Adresse. Nach der Anmeldung erhältst du eine
          Bestätigungs-E-Mail; erst nach deiner Bestätigung versenden wir Newsletter
          (Double-Opt-in). Deine Einwilligung kannst du jederzeit widerrufen – über den
          Abmeldelink in jeder E-Mail oder in deinem Konto. Wir speichern Zeitpunkt der Anmeldung
          und der Bestätigung als Nachweis der Einwilligung.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. Kontaktformular</h2>
        <p className="mb-4">
          Die im Kontaktformular angegebenen Daten (Name, E-Mail-Adresse, Betreff, Nachricht) werden
          gespeichert und per E-Mail an uns weitergeleitet, um deine Anfrage zu bearbeiten.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. KI-generierte Inhalte</h2>
        <p className="mb-4">
          Produktbeschreibungen und Empfehlungen werden automatisiert aus öffentlichen
          Produktdaten erzeugt – teils KI-gestützt, teils regelbasiert. Dabei werden{' '}
          <strong>keine Nutzerdaten</strong> an KI-Dienste übermittelt: Die Texte entstehen vorab in
          einem separaten Prozess, nicht während deines Besuchs.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">10. Deine Rechte</h2>
        <p className="mb-4">
          Du hast das Recht auf Auskunft über deine gespeicherten Daten sowie auf Berichtigung,
          Löschung und Einschränkung der Verarbeitung. Außerdem kannst du der Verarbeitung
          widersprechen und dich bei einer Aufsichtsbehörde beschweren.
        </p>

        <p className="mt-8 text-sm text-gray-500">Stand: Juli 2026</p>
      </div>
    </div>
  )
}
