import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

supabase: Optional[Any] = None

if supabase_url and supabase_key:
    try:
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase connected")
    except Exception as e:
        print(f"Supabase init error: {e}")
else:
    print("Supabase not configured — using local JSON storage")

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

    if supabase:
        try:
            for product in products:
                product['updated_at'] = 'now()'
            response = supabase.table('products').upsert(products, on_conflict='external_id').execute()
            print(f"Upserted {len(products)} products to Supabase")
            return response
        except Exception as e:
            print(f"Supabase error: {e}")

    _save_local_json(products)

async def get_all_products() -> List[Dict[str, Any]]:
    if supabase:
        try:
            response = supabase.table('products').select('*').execute()
            return response.data or []
        except Exception as e:
            print(f"Supabase query error: {e}")
    return _load_local_json()

async def delete_product(external_id: str) -> None:
    if supabase:
        try:
            supabase.table('products').delete().eq('external_id', external_id).execute()
            print(f"Deleted product: {external_id}")
        except Exception as e:
            print(f"Delete error: {e}")
