import os
import asyncio
from typing import Dict, Any

TEMPLATE_HTML = """
<!DOCTYPE html>
<html>
<head>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    .container {{
      width: 1080px;
      height: 1080px;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      position: relative;
      overflow: hidden;
    }}
    .badge {{
      position: absolute;
      top: 40px;
      right: 40px;
      background: #F97316;
      color: white;
      font-size: 48px;
      font-weight: bold;
      padding: 20px 40px;
      border-radius: 12px;
    }}
    .product-image {{
      width: 400px;
      height: 400px;
      object-fit: contain;
      margin-bottom: 40px;
    }}
    .content {{
      text-align: center;
      padding: 40px;
    }}
    .brand {{
      color: #64748B;
      font-size: 24px;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 20px;
    }}
    .name {{
      color: white;
      font-size: 52px;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: 30px;
      max-width: 800px;
    }}
    .price-container {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 40px;
    }}
    .price {{
      color: #F97316;
      font-size: 64px;
      font-weight: bold;
    }}
    .original-price {{
      color: #64748B;
      font-size: 36px;
      text-decoration: line-through;
    }}
    .cta {{
      background: #22C55E;
      color: white;
      font-size: 32px;
      font-weight: bold;
      padding: 20px 60px;
      border-radius: 8px;
      display: inline-block;
    }}
    .logo {{
      position: absolute;
      bottom: 40px;
      left: 40px;
      color: white;
      font-size: 28px;
      font-weight: bold;
    }}
    .logo span {{
      color: #F97316;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">-SAVINGS%</div>
    <img class="product-image" src="IMAGE_URL" alt="Product" />
    <div class="content">
      <div class="brand">BRAND</div>
      <div class="name">PRODUCT_NAME</div>
      <div class="price-container">
        <span class="price">€PRICE</span>
        <span class="original-price">€ORIGINAL_PRICE</span>
      </div>
      <div class="cta">Jetzt kaufen →</div>
    </div>
    <div class="logo">IT<span>Trends</span></div>
  </div>
</body>
</html>
"""

def generate_html(product: Dict[str, Any], savings: int) -> str:
    """Generate HTML for the ad creative"""
    savings_percent = f"-{savings}%" if savings > 0 else ""

    return TEMPLATE_HTML.replace('IMAGE_URL', product.get('image_url', '')) \
        .replace('BRAND', product.get('brand', '').upper()) \
        .replace('PRODUCT_NAME', product.get('name', '')[:60]) \
        .replace('SAVINGS', savings_percent) \
        .replace('PRICE', f"{product.get('price', 0):.2f}".replace('.', ',')) \
        .replace('ORIGINAL_PRICE', f"{product.get('original_price', 0):.2f}".replace('.', ','))


async def generate_ad_creative(product: Dict[str, Any], output_path: str) -> str:
    """
    Generate ad creative using Puppeteer/Playwright.
    This creates a programmatic screenshot of the HTML template.

    Requirements:
    - npm install -g puppeteer
    - or: npx playwright

    In production, you'd use Node.js with Puppeteer for this.
    """
    savings = 0
    if product.get('original_price') and product.get('price'):
        savings = int(((product['original_price'] - product['price']) / product['original_price']) * 100)

    html_content = generate_html(product, savings)

    html_path = output_path.replace('.png', '.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Generated HTML template: {html_path}")
    print(f"To generate PNG, run: npx puppeteer screenshot {html_path} --output {output_path}")

    return html_path


async def main():
    """Example usage"""
    sample_product = {
        'name': 'Apple MacBook Pro 14" M3 Pro',
        'brand': 'Apple',
        'price': 1999.00,
        'original_price': 2249.00,
        'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
    }

    await generate_ad_creative(sample_product, 'ad-creative.png')

if __name__ == '__main__':
    asyncio.run(main())