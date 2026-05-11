import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Über uns',
  description: 'Erfahre mehr über IT-Trends und unser Ziel, dir die besten Tech-Deals zu bieten.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">Über uns</h1>
      
      <div className="prose max-w-none text-gray-600">
        <p className="text-lg mb-6">
          Willkommen bei IT-Trends! Wir sind dein kompetenter Partner für aktuelle Tech-Deals und Produktvergleiche.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Unsere Mission</h2>
        <p className="mb-4">
          Unser Ziel ist es, dir die aktuellsten Technik-Angebote zu präsentieren und dir beim Kauf Entscheidungshilfen zu bieten. 
          Wir vergleichen Preise von verschiedenen Händlern und zeigen dir die besten Deals.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Was wir bieten</h2>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Aktuelle Tech-Deals und Angebote</li>
          <li>Preisvergleiche für Laptops, Smartphones und mehr</li>
          <li>Produktbewertungen und Empfehlungen</li>
          <li>Affiliate-Links zu vertrauenswürdigen Händlern</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Kontakt</h2>
        <p className="mb-4">
          Du hast Fragen oder Feedback? Nutze unser <a href="/contact" className="text-primary hover:underline">Kontaktformular</a> 
          oder schreibe uns eine E-Mail.
        </p>
      </div>
    </div>
  )
}