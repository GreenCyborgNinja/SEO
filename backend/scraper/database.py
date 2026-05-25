import os
import json
from datetime import datetime
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(__file__)


def _save_local_json(products: List[Dict[str, Any]]) -> None:
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    ts_path = os.path.join(BASE_DIR, f'products_{ts}.json')
    with open(ts_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(products)} products to {ts_path}")
    latest_path = os.path.join(BASE_DIR, 'latest-products.json')
    with open(latest_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"Also saved to {latest_path}")


def _load_local_json() -> List[Dict[str, Any]]:
    latest = os.path.join(BASE_DIR, 'latest-products.json')
    if os.path.exists(latest):
        with open(latest, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


async def upsert_products(products: List[Dict[str, Any]]) -> None:
    if not products:
        return
    _save_local_json(products)


async def get_all_products() -> List[Dict[str, Any]]:
    return _load_local_json()


async def delete_product(external_id: str) -> None:
    products = _load_local_json()
    products = [p for p in products if p.get('external_id') != external_id]
    _save_local_json(products)
    print(f"Deleted product: {external_id}")
