import os
import httpx
from typing import List, Dict, Any, Optional

RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com"
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")

BASE_URL = f"https://{RAPIDAPI_HOST}"

HEADERS = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST,
    "Content-Type": "application/json",
}


def _get_headers() -> dict:
    if not RAPIDAPI_KEY:
        raise ValueError("RAPIDAPI_KEY environment variable is not set")
    return {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }


async def search_products(
    query: str,
    country: str = "DE",
    page: int = 1,
    sort_by: str = "RELEVANCE",
    product_condition: str = "ALL",
    is_prime: bool = False,
    deals_and_discounts: str = "NONE",
) -> List[Dict[str, Any]]:
    params = {
        "query": query,
        "country": country,
        "page": str(page),
        "sort_by": sort_by,
        "product_condition": product_condition,
        "is_prime": str(is_prime).lower(),
        "deals_and_discounts": deals_and_discounts,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/search",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return (data.get("data", {}) or {}).get("products", [])


async def product_details(
    asin: str,
    country: str = "DE",
) -> Dict[str, Any]:
    params = {"asin": asin, "country": country}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/product-details",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return data.get("data", {}) or {}


async def product_offers(
    asin: str,
    country: str = "DE",
    limit: int = 100,
    page: int = 1,
) -> Dict[str, Any]:
    params = {
        "asin": asin,
        "country": country,
        "limit": str(limit),
        "page": str(page),
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/product-offers",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return data.get("data", {}) or {}


async def best_sellers(
    category: str = "software",
    best_seller_type: str = "BEST_SELLERS",
    page: int = 1,
    country: str = "DE",
) -> List[Dict[str, Any]]:
    params = {
        "category": category,
        "type": best_seller_type,
        "page": str(page),
        "country": country,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/best-sellers",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return (data.get("data", {}) or {}).get("best_sellers", [])


async def deals_v2(
    country: str = "DE",
    min_product_star_rating: str = "ALL",
    price_range: str = "ALL",
    discount_range: str = "ALL",
) -> List[Dict[str, Any]]:
    params = {
        "country": country,
        "min_product_star_rating": min_product_star_rating,
        "price_range": price_range,
        "discount_range": discount_range,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/deals-v2",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return (data.get("data", {}) or {}).get("deals", [])


async def deal_products(
    deal_id: str,
    country: str = "DE",
    sort_by: str = "FEATURED",
    page: int = 1,
) -> List[Dict[str, Any]]:
    params = {
        "country": country,
        "sort_by": sort_by,
        "page": str(page),
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/deal-products",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return (data.get("data", {}) or {}).get("deal_products", [])


async def product_category_list(country: str = "DE") -> List[Dict[str, Any]]:
    params = {"country": country}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/product-category-list",
            headers=_get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ERROR":
            raise Exception(f"RapidAPI error: {data.get('error', {}).get('message', 'Unknown error')}")
        return data.get("data", []) or []


def transform_rapidapi_product(product: Dict[str, Any], category: Optional[str] = None) -> Dict[str, Any]:
    return {
        "external_id": product.get("asin", ""),
        "name": product.get("product_title", ""),
        "description": product.get("product_description", ""),
        "seo_description": None,
        "price": float(product.get("product_price", 0) or 0),
        "original_price": float(product.get("product_original_price", 0) or 0) or None,
        "affiliate_url": product.get("product_url", ""),
        "image_url": product.get("product_photo", ""),
        "category": category or product.get("category_path", "").split(">")[0].strip() if product.get("category_path") else None,
        "brand": product.get("product_details", {}).get("brand") if isinstance(product.get("product_details"), dict) else None,
        "rating": float(product.get("product_star_rating", 0) or 0) or None,
        "review_count": int(product.get("product_num_ratings", 0) or 0),
    }


def transform_rapidapi_deal(deal: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "external_id": deal.get("deal_id", ""),
        "name": deal.get("deal_title", ""),
        "description": deal.get("deal_description", ""),
        "seo_description": None,
        "price": float(deal.get("deal_price", {}).get("price", 0) or 0) if isinstance(deal.get("deal_price"), dict) else float(deal.get("deal_price", 0) or 0),
        "original_price": float(deal.get("list_price", 0) or 0) or None,
        "affiliate_url": deal.get("deal_url", ""),
        "image_url": deal.get("deal_photo", ""),
        "category": deal.get("deal_category", ""),
        "brand": None,
        "rating": float(deal.get("deal_star_rating", 0) or 0) or None,
        "review_count": int(deal.get("deal_num_ratings", 0) or 0),
    }


def transform_rapidapi_best_seller(product: Dict[str, Any], category: Optional[str] = None) -> Dict[str, Any]:
    return {
        "external_id": product.get("asin", ""),
        "name": product.get("product_title", ""),
        "description": product.get("product_description", ""),
        "seo_description": None,
        "price": float(product.get("product_price", 0) or 0),
        "original_price": float(product.get("list_price", 0) or 0) or None,
        "affiliate_url": product.get("product_url", ""),
        "image_url": product.get("product_photo", ""),
        "category": category or product.get("category_path", "").split(">")[0].strip() if product.get("category_path") else None,
        "brand": None,
        "rating": float(product.get("product_star_rating", 0) or 0) or None,
        "review_count": int(product.get("product_num_ratings", 0) or 0),
    }
