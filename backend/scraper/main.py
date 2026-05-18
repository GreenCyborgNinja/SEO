import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from fetcher import fetch_products
from database import upsert_products


async def main():
    print(f"[{datetime.now()}] Starting product sync via RapidAPI...")

    if not os.getenv("RAPIDAPI_KEY"):
        print("ERROR: RAPIDAPI_KEY environment variable is not set")
        return

    products = await fetch_products()
    print(f"Fetched {len(products)} products from RapidAPI")

    await upsert_products(products)

    product_descriptions = [p for p in products if p.get("description")]
    print(f"Products with descriptions: {len(product_descriptions)}/{len(products)}")

    print(f"[{datetime.now()}] Sync complete!")


if __name__ == "__main__":
    asyncio.run(main())
