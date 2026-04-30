import os
import asyncio
from datetime import datetime
from fetcher import fetch_products
from seo_generator import generate_seo_content
from database import upsert_products, get_products_without_seo

async def main():
    print(f"[{datetime.now()}] Starting product sync...")

    products = await fetch_products()
    print(f"Fetched {len(products)} products from source")

    for product in products:
        if not product.get('seo_description'):
            try:
                seo_text = await generate_seo_content(product)
                product['seo_description'] = seo_text
                print(f"Generated SEO for: {product['name'][:50]}...")
            except Exception as e:
                print(f"SEO generation failed for {product.get('name')}: {e}")

    await upsert_products(products)
    print(f"Synced {len(products)} products to database")

    products_without_seo = await get_products_without_seo()
    if products_without_seo:
        print(f"Updating SEO for {len(products_without_seo)} products without SEO...")
        for product in products_without_seo:
            try:
                seo_text = await generate_seo_content(product)
                await upsert_products([{**product, 'seo_description': seo_text}])
                print(f"Updated SEO for: {product['name'][:50]}...")
            except Exception as e:
                print(f"SEO update failed: {e}")

    print(f"[{datetime.now()}] Sync complete!")

if __name__ == "__main__":
    asyncio.run(main())