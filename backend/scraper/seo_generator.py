import os
from dotenv import load_dotenv
import groq
from typing import Dict, Any

load_dotenv()

client = groq.Groq(api_key=os.getenv('GROQ_API_KEY', ''))

if not os.getenv('GROQ_API_KEY'):
    print("WARNING: GROQ_API_KEY not found in environment")

async def generate_seo_content(product: Dict[str, Any]) -> str:
    """
    Generate SEO-optimized product description using Groq (Llama 3).
    The free tier provides generous limits for this use case.
    """
    model = os.getenv('SEO_MODEL', 'llama-3.1-8b-instant')

    prompt = f"""Du bist ein SEO-Experte undProdukttester. Schreibe eine SEO-optimierte Produktbeschreibung (maximal 160 Zeichen für Meta Description, 2-3 Sätze für den Haupttext).

Produkt: {product['name']}
Marke: {product.get('brand', 'Unbekannt')}
Kategorie: {product.get('category', 'Technik')}
Preis: €{product.get('price', 0)}

Beschreibung: {product.get('description', '')}

Schreibe in Deutsch. Die Beschreibung soll:
1. Einzigartig und nicht vom Original kopiert sein
2. Relevante Keywords enthalten
3. Zum Kaufen animieren aber nicht spammen
4. Natürlich und informativ klingen

Gib nur die Beschreibung zurück, keine Überschriften oder Formatierung."""

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "Du bist ein erfahrener SEO-Texter, der einzigartige Produktbeschreibungen erstellt."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=200
        )

        return completion.choices[0].message.content.strip()

    except groq.AuthenticationError as e:
        print(f"Groq auth error: Invalid API key")
        return fallback_seo_description(product)
    except groq.RateLimitError as e:
        print(f"Groq rate limit error")
        return fallback_seo_description(product)
    except Exception as e:
        print(f"Groq API error: {e}")
        return fallback_seo_description(product)

def fallback_seo_description(product: Dict[str, Any]) -> str:
    """Fallback when API is not available"""
    return f"Entdecke {product['name']} von {product.get('brand', 'Top-Marken')} – die perfekte Wahl für alle, die Wert auf Qualität und moderne Technik legen. Jetzt günstig bei Daily Trends kaufen!"