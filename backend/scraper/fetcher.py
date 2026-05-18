import os
from typing import List, Dict, Any

from rapidapi_client import (
    search_products,
    best_sellers,
    deals_v2,
    transform_rapidapi_product,
    transform_rapidapi_deal,
    transform_rapidapi_best_seller,
)

SEARCH_QUERIES = [
    "Laptop",
    "Smartphone",
    "Kopfhörer",
    "Gaming",
    "Tablet",
    "Smartwatch",
    "Monitor",
    "Drucker",
    "Maus",
    "Tastatur",
    "Router",
    "Festplatte",
    "USB-C Hub",
    "Webcam",
    "Lautsprecher",
]

BEST_SELLER_CATEGORIES = [
    "computers",
    "electronics",
    "software",
    "video-games",
    "office-products",
]

COUNTRY = os.getenv("RAPIDAPI_COUNTRY", "DE")


async def fetch_products() -> List[Dict[str, Any]]:
    products = []
    seen_asins = set()

    for query in SEARCH_QUERIES:
        try:
            print(f"Searching: {query} (country={COUNTRY})...")
            results = await search_products(
                query=query,
                country=COUNTRY,
                page=1,
                sort_by="RELEVANCE",
            )
            for item in results:
                asin = item.get("asin")
                if asin and asin not in seen_asins:
                    seen_asins.add(asin)
                    products.append(transform_rapidapi_product(item))
            print(f"  Got {len(results)} results, total unique: {len(products)}")
        except Exception as e:
            print(f"  Search error for '{query}': {e}")

    for cat in BEST_SELLER_CATEGORIES:
        try:
            print(f"Best sellers: {cat} (country={COUNTRY})...")
            results = await best_sellers(
                category=cat,
                best_seller_type="BEST_SELLERS",
                country=COUNTRY,
            )
            for item in results:
                asin = item.get("asin")
                if asin and asin not in seen_asins:
                    seen_asins.add(asin)
                    products.append(transform_rapidapi_best_seller(item, category=cat))
            print(f"  Got {len(results)} best sellers, total unique: {len(products)}")
        except Exception as e:
            print(f"  Best sellers error for '{cat}': {e}")

    try:
        print(f"Deals (country={COUNTRY})...")
        deals = await deals_v2(country=COUNTRY)
        for deal in deals:
            products.append(transform_rapidapi_deal(deal))
        print(f"  Got {len(deals)} deals, total: {len(products)}")
    except Exception as e:
        print(f"  Deals error: {e}")

    return products
