import os
import asyncio
from datetime import datetime
from fetcher import fetch_products
from seo_generator import generate_seo_content
from database import upsert_products, get_products_without_seo, get_all_products

async def main():
    print(f"[{datetime.now()}] Starting product sync...")

    products = await fetch_products()
    print(f"Fetched {len(products)} products from source")

    existing_products = await get_all_products()
    seo_map = {p['external_id']: p.get('seo_description') for p in existing_products}

    for product in products:
        ext_id = product.get('external_id')

        if ext_id in seo_map and seo_map[ext_id]:
            product['seo_description'] = seo_map[ext_id]
            print(f"Behalte existierende SEO für: {product['name'][:50]}...")
        else:
            try:
                seo_text = await generate_seo_content(product)
                product['seo_description'] = seo_text
                print(f"Generiere NEUE SEO für: {product['name'][:50]}...")
            except Exception as e:
                print(f"SEO fehlgeschlagen: {e}")

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