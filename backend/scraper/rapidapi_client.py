"""RapidAPI "Real-Time Amazon Data" client.

Adds three things the previous version was missing:
  * retry with exponential backoff + jitter on 429/5xx/timeouts,
  * a hard call budget derived from the x-ratelimit headers, so a run stops
    instead of burning through the 100-requests/day free tier,
  * proper category/brand mapping (see transform_* below).
"""

import asyncio
import os
import random
from typing import Any, Dict, List, Optional

import httpx

from normalize import clean_text, extract_brand, normalize_rating, parse_int, parse_price

RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com"
BASE_URL = f"https://{RAPIDAPI_HOST}"

MAX_ATTEMPTS = 4
BASE_DELAY = 2.0
DEFAULT_TIMEOUT = 30.0

# Free tier is 100 requests/day — stay well below it by default.
MAX_API_CALLS = int(os.getenv("MAX_API_CALLS", "80"))


class RateLimitExhausted(RuntimeError):
    """Raised when the call budget or the provider's quota is used up."""


class ApiUsage:
    """Tracks what this run spent, so main.py can report it and stop early."""

    def __init__(self) -> None:
        self.calls = 0
        self.remaining: Optional[int] = None
        self.limit: Optional[int] = None

    def note_headers(self, headers: httpx.Headers) -> None:
        for key in ("x-ratelimit-requests-remaining", "x-ratelimit-rapid-free-plans-hard-limit-remaining"):
            if key in headers:
                try:
                    self.remaining = int(headers[key])
                except ValueError:
                    pass
                break
        for key in ("x-ratelimit-requests-limit", "x-ratelimit-rapid-free-plans-hard-limit-limit"):
            if key in headers:
                try:
                    self.limit = int(headers[key])
                except ValueError:
                    pass
                break


usage = ApiUsage()


def _get_headers() -> dict:
    key = os.getenv("RAPIDAPI_KEY", "")
    if not key:
        raise ValueError("RAPIDAPI_KEY environment variable is not set")
    return {
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }


async def _request(path: str, params: Dict[str, str]) -> Dict[str, Any]:
    """GET with retry/backoff. Raises RateLimitExhausted once the budget is gone."""
    if usage.calls >= MAX_API_CALLS:
        raise RateLimitExhausted(f"local call budget reached ({MAX_API_CALLS} requests, MAX_API_CALLS)")
    if usage.remaining is not None and usage.remaining <= 0:
        raise RateLimitExhausted("provider quota exhausted (x-ratelimit-requests-remaining = 0)")

    last_error: Optional[Exception] = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            usage.calls += 1
            async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
                response = await client.get(f"{BASE_URL}{path}", headers=_get_headers(), params=params)

            usage.note_headers(response.headers)

            if response.status_code == 429:
                raise httpx.HTTPStatusError("rate limited", request=response.request, response=response)
            response.raise_for_status()

            data = response.json()
            if data.get("status") == "ERROR":
                message = (data.get("error") or {}).get("message", "unknown error")
                raise RuntimeError(f"RapidAPI error: {message}")
            return data

        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            last_error = exc
            # A 429 whose headers report 0 remaining is a daily-quota wall, not a
            # burst limit: retrying cannot succeed, so stop the whole run instead
            # of spending three more requests per query.
            if status == 429 and usage.remaining is not None and usage.remaining <= 0:
                raise RateLimitExhausted(
                    f"provider quota exhausted after {usage.calls} calls "
                    f"(limit {usage.limit if usage.limit is not None else 'unknown'}) — try again tomorrow"
                ) from exc
            if status not in (429, 500, 502, 503, 504) or attempt == MAX_ATTEMPTS:
                raise
            retry_after = exc.response.headers.get("retry-after")
            delay = float(retry_after) if retry_after and retry_after.isdigit() else BASE_DELAY * 2 ** (attempt - 1)
            delay += random.uniform(0, 0.5)
            print(f"    ! HTTP {status} — retrying in {delay:.1f}s (attempt {attempt}/{MAX_ATTEMPTS})")
            await asyncio.sleep(delay)

        except (httpx.TimeoutException, httpx.TransportError) as exc:
            last_error = exc
            if attempt == MAX_ATTEMPTS:
                raise
            delay = BASE_DELAY * 2 ** (attempt - 1) + random.uniform(0, 0.5)
            print(f"    ! {type(exc).__name__} — retrying in {delay:.1f}s (attempt {attempt}/{MAX_ATTEMPTS})")
            await asyncio.sleep(delay)

    raise last_error if last_error else RuntimeError("request failed")


async def search_products(
    query: str,
    country: str = "DE",
    page: int = 1,
    sort_by: str = "RELEVANCE",
    product_condition: str = "ALL",
    is_prime: bool = False,
    deals_and_discounts: str = "NONE",
) -> List[Dict[str, Any]]:
    data = await _request(
        "/search",
        {
            "query": query,
            "country": country,
            "page": str(page),
            "sort_by": sort_by,
            "product_condition": product_condition,
            "is_prime": str(is_prime).lower(),
            "deals_and_discounts": deals_and_discounts,
        },
    )
    return (data.get("data", {}) or {}).get("products", [])


async def best_sellers(
    category: str = "computers",
    best_seller_type: str = "BEST_SELLERS",
    page: int = 1,
    country: str = "DE",
) -> List[Dict[str, Any]]:
    data = await _request(
        "/best-sellers",
        {"category": category, "type": best_seller_type, "page": str(page), "country": country},
    )
    return (data.get("data", {}) or {}).get("best_sellers", [])


async def deals_v2(
    country: str = "DE",
    min_product_star_rating: str = "ALL",
    price_range: str = "ALL",
    discount_range: str = "ALL",
) -> List[Dict[str, Any]]:
    data = await _request(
        "/deals-v2",
        {
            "country": country,
            "min_product_star_rating": min_product_star_rating,
            "price_range": price_range,
            "discount_range": discount_range,
        },
    )
    return (data.get("data", {}) or {}).get("deals", [])


async def product_details(asin: str, country: str = "DE") -> Dict[str, Any]:
    data = await _request("/product-details", {"asin": asin, "country": country})
    return data.get("data", {}) or {}


def _first_category_segment(product: Dict[str, Any]) -> Optional[str]:
    """Amazon's category_path, when present, e.g. 'Computer > Laptops'."""
    path = product.get("category_path")
    if isinstance(path, list) and path:
        first = path[0]
        return clean_text(first.get("name") if isinstance(first, dict) else first)
    if isinstance(path, str) and path:
        return clean_text(path.split(">")[0])
    return None


def _brand_from_payload(product: Dict[str, Any]) -> Optional[str]:
    details = product.get("product_details")
    if isinstance(details, dict):
        for key in ("brand", "Marke", "Hersteller", "manufacturer"):
            if details.get(key):
                return clean_text(details[key])
    for key in ("brand", "product_brand", "product_byline"):
        if product.get(key):
            return clean_text(product[key])
    return None


def _base_product(
    product: Dict[str, Any],
    price_key: str,
    original_price_key: str,
    category: Optional[str],
) -> Dict[str, Any]:
    name = clean_text(product.get("product_title")) or ""
    price = parse_price(product.get(price_key))
    original_price = parse_price(product.get(original_price_key))
    brand = extract_brand(name, _brand_from_payload(product))
    asin = (product.get("asin") or "").strip()

    return {
        "external_id": asin,
        "name": name,
        # Descriptions are generated separately (npm run ai:descriptions); the
        # search endpoint never returns usable copy.
        "description": None,
        "seo_description": None,
        "price": price if price and price > 0 else None,
        "original_price": original_price if original_price and original_price > 0 else None,
        "affiliate_url": clean_text(product.get("product_url")) or (f"https://www.amazon.de/dp/{asin}" if asin else ""),
        "image_url": clean_text(product.get("product_photo")),
        # FIXED: this used to read
        #   category or product.get(...) if product.get("category_path") else None
        # which Python parses as `(category or ...) if cond else None`. Since
        # /search and /best-sellers never return category_path, the condition was
        # always false and EVERY product ended up with category = None — the
        # explicit category argument was silently thrown away.
        "category": category or _first_category_segment(product),
        "brand": brand,
        "rating": normalize_rating(product.get("product_star_rating")),
        "review_count": parse_int(product.get("product_num_ratings")),
    }


def transform_rapidapi_product(product: Dict[str, Any], category: Optional[str] = None) -> Dict[str, Any]:
    return _base_product(product, "product_price", "product_original_price", category)


def transform_rapidapi_best_seller(product: Dict[str, Any], category: Optional[str] = None) -> Dict[str, Any]:
    return _base_product(product, "product_price", "list_price", category)


def transform_rapidapi_deal(deal: Dict[str, Any], category: Optional[str] = None) -> Dict[str, Any]:
    """Deals use a different payload shape and carry a deal_id, not an ASIN."""
    name = clean_text(deal.get("deal_title")) or ""
    price = parse_price(deal.get("deal_price"))
    original_price = parse_price(deal.get("list_price"))
    external_id = (deal.get("asin") or deal.get("deal_id") or "").strip()

    return {
        "external_id": external_id,
        "name": name,
        "description": None,
        "seo_description": None,
        "price": price if price and price > 0 else None,
        "original_price": original_price if original_price and original_price > 0 else None,
        "affiliate_url": clean_text(deal.get("deal_url")) or "",
        "image_url": clean_text(deal.get("deal_photo")),
        "category": category,
        "brand": extract_brand(name),
        "rating": normalize_rating(deal.get("deal_star_rating")),
        "review_count": parse_int(deal.get("deal_num_ratings")),
    }
