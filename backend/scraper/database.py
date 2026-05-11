import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict, Any

load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

async def upsert_products(products: List[Dict[str, Any]]) -> None:
    """Insert or update products in the database"""
    if not products:
        return

    for product in products:
        product['updated_at'] = 'now()'

    try:
        response = supabase.table('products').upsert(
            products,
            on_conflict='external_id'
        ).execute()

        print(f"Upserted {len(products)} products")
        return response

    except Exception as e:
        print(f"Database error: {e}")
        raise

async def get_products_without_seo() -> List[Dict[str, Any]]:
    """Get products that don't have SEO descriptions yet"""
    try:
        response = supabase.table('products').select('*').is_('seo_description', None).execute()
        return response.data or []
    except Exception as e:
        print(f"Query error: {e}")
        return []

async def get_all_products() -> List[Dict[str, Any]]:
    """Get all products from database"""
    try:
        response = supabase.table('products').select('*').execute()
        return response.data or []
    except Exception as e:
        print(f"Query error: {e}")
        return []

async def delete_product(external_id: str) -> None:
    """Delete a product by external_id"""
    try:
        supabase.table('products').delete().eq('external_id', external_id).execute()
        print(f"Deleted product: {external_id}")
    except Exception as e:
        print(f"Delete error: {e}")