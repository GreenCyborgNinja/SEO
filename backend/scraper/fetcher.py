"""Fetch orchestration.

What to fetch is derived from shared/taxonomy.json, so every category the shop
displays is actually filled by the scraper — and every scraped product carries
the taxonomy slug it belongs to.
"""

import os
from typing import Any, Dict, List

from rapidapi_client import (
    RateLimitExhausted,
    best_sellers,
    deals_v2,
    search_products,
    transform_rapidapi_best_seller,
    transform_rapidapi_deal,
    transform_rapidapi_product,
    usage,
)
from taxonomy import assign_category, best_seller_categories, search_queries

COUNTRY = os.getenv("RAPIDAPI_COUNTRY", "DE")


def _keep(product: Dict[str, Any], seen: set) -> bool:
    external_id = product.get("external_id")
    if not external_id or external_id in seen or not product.get("name") or not product.get("price"):
        return False
    seen.add(external_id)
    return True


async def fetch_products() -> List[Dict[str, Any]]:
    products: List[Dict[str, Any]] = []
    seen: set = set()

    try:
        for entry in search_queries():
            query, pages, slug = entry["query"], entry["pages"], entry["slug"]
            for page in range(1, pages + 1):
                try:
                    print(f"Searching: {query} (page {page}/{pages}, country={COUNTRY})...")
                    results = await search_products(query=query, country=COUNTRY, page=page)
                except RateLimitExhausted:
                    raise
                except Exception as exc:
                    print(f"  ! search error for '{query}' page {page}: {exc}")
                    break

                if not results:
                    print(f"  no more results for '{query}' at page {page}")
                    break

                for item in results:
                    # The taxonomy slug is passed explicitly — the previous version
                    # omitted it entirely for search results.
                    product = transform_rapidapi_product(item, category=slug)
                    if _keep(product, seen):
                        products.append(product)
                print(f"  got {len(results)} results, {len(products)} unique so far")

        for entry in best_seller_categories():
            try:
                print(f"Best sellers: {entry['amazon_category']} (country={COUNTRY})...")
                results = await best_sellers(category=entry["amazon_category"], country=COUNTRY)
            except RateLimitExhausted:
                raise
            except Exception as exc:
                print(f"  ! best-seller error for '{entry['amazon_category']}': {exc}")
                continue

            for item in results:
                product = transform_rapidapi_best_seller(item, category=entry["slug"])
                if _keep(product, seen):
                    products.append(product)
            print(f"  got {len(results)} best sellers, {len(products)} unique so far")

        try:
            print(f"Deals (country={COUNTRY})...")
            deals = await deals_v2(country=COUNTRY)
            for deal in deals:
                product = transform_rapidapi_deal(deal)
                # Deals have no category of their own — derive it from the title.
                product["category"] = assign_category(product["name"], product.get("brand"))
                if _keep(product, seen):
                    products.append(product)
            print(f"  got {len(deals)} deals, {len(products)} unique in total")
        except RateLimitExhausted:
            raise
        except Exception as exc:
            print(f"  ! deals error: {exc}")

    except RateLimitExhausted as exc:
        # Not a failure: keep what we have instead of throwing the run away.
        print(f"\n! stopping early: {exc}")
        print(f"  keeping the {len(products)} products fetched so far")

    print(f"\nAPI calls used: {usage.calls}" + (f" (provider remaining: {usage.remaining})" if usage.remaining is not None else ""))
    return products
