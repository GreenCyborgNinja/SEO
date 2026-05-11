import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Rechtliche Informationen und Anbieterkennung gemäß § 5 TMG.',
}

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-primary mb-8">Impressum</h1>
      
      <div className="prose prose-lg text-gray-600 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">Angaben gemäß § 5 TMG</h2>
          <p>
            <strong>IT-Trends</strong><br />
            Musterstraße 123<br />
            12345 Musterstadt<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">Kontakt</h2>
          <p>
            E-Mail: kontakt@it-trends.de<br />
            Telefon: +49 (0) 123 456789
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            Max Mustermann<br />
            Musterstraße 123<br />
            12345 Musterstadt
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
          <p className="mt-4">
            Die Produktinformationen werden automatisch aggregiert und in regelmäßigen Intervallen aktualisiert. Zwischen den Aktualisierungen können Preise und Verfügbarkeit abweichen. Bitte prüfe die angegebenen Preise vor dem Kauf direkt beim Händler.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">Amazon Partnerprogramm</h2>
          <p>
            Als Amazon-Partner verdiene ich an qualifizierten Käufen. Die auf dieser Seite eingebundenen Links zu Amazon.de sind Affiliate-Links. Durch diese Links unterstützt du uns, ohne dass dir zusätzliche Kosten entstehen.
          </p>
        </section>
      </div>
    </div>
  )
}