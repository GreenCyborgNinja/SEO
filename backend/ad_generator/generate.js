const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const products = [
  {
    name: 'Apple MacBook Pro 14" M3 Pro',
    brand: 'Apple',
    price: 1999.00,
    originalPrice: 2249.00,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 1399.00,
    originalPrice: 1499.00,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'
  },
  {
    name: 'Sony PlayStation 5 Slim',
    brand: 'Sony',
    price: 449.00,
    originalPrice: 499.00,
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'
  }
];

const htmlTemplate = (product, savings) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .container {
      width: 1080px;
      height: 1080px;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', Arial, sans-serif;
      position: relative;
      overflow: hidden;
    }
    .badge {
      position: absolute;
      top: 40px;
      right: 40px;
      background: #F97316;
      color: white;
      font-size: 48px;
      font-weight: 800;
      padding: 20px 40px;
      border-radius: 12px;
    }
    .product-image {
      width: 400px;
      height: 400px;
      object-fit: contain;
      margin-bottom: 40px;
    }
    .content {
      text-align: center;
      padding: 40px;
    }
    .brand {
      color: #64748B;
      font-size: 24px;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 20px;
    }
    .name {
      color: white;
      font-size: 52px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 30px;
      max-width: 800px;
    }
    .price-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 40px;
    }
    .price {
      color: #F97316;
      font-size: 64px;
      font-weight: 800;
    }
    .original-price {
      color: #64748B;
      font-size: 36px;
      text-decoration: line-through;
    }
    .cta {
      background: #22C55E;
      color: white;
      font-size: 32px;
      font-weight: 700;
      padding: 20px 60px;
      border-radius: 8px;
      display: inline-block;
    }
    .logo {
      position: absolute;
      bottom: 40px;
      left: 40px;
      color: white;
      font-size: 28px;
      font-weight: 700;
    }
    .logo span { color: #F97316; }
    .disclaimer {
      position: absolute;
      bottom: 40px;
      right: 40px;
      color: #64748B;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">-${savings}%</div>
    <img class="product-image" src="${product.imageUrl}" alt="${product.name}" />
    <div class="content">
      <div class="brand">${product.brand.toUpperCase()}</div>
      <div class="name">${product.name}</div>
      <div class="price-container">
        <span class="price">€${product.price.toFixed(2).replace('.', ',')}</span>
        <span class="original-price">€${product.originalPrice.toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="cta">Jetzt kaufen →</div>
    </div>
    <div class="logo">IT<span>Trends</span></div>
    <div class="disclaimer">Affiliate-Werbung</div>
  </div>
</body>
</html>
`;

async function generateAdCreative(product, outputPath) {
  const savings = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const html = htmlTemplate(product, savings);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();

  console.log(`Generated: ${outputPath}`);
}

async function main() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const sanitizedName = product.name.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    const outputPath = path.join(outputDir, `ad-${i + 1}-${sanitizedName}.png`);

    await generateAdCreative(product, outputPath);
  }

  console.log('All ad creatives generated!');
}

main().catch(console.error);