"""Deprecated storage module.

Storage moved to db.py (SQLite) — the JSON file is now an export, not the
database. Kept as a thin shim so any older script/notebook still runs.
"""

import json
from typing import Any, Dict, List

from db import connect, export_snapshot
from db import upsert_products as _upsert_products
from paths import SNAPSHOT_PATH


async def upsert_products(products: List[Dict[str, Any]]) -> None:
    _upsert_products(products)
    export_snapshot()


async def get_all_products() -> List[Dict[str, Any]]:
    connection = connect()
    try:
        return [dict(row) for row in connection.execute("SELECT * FROM products ORDER BY id")]
    finally:
        connection.close()


async def delete_product(external_id: str) -> None:
    connection = connect()
    try:
        with connection:
            connection.execute("DELETE FROM products WHERE external_id = ?", (external_id,))
    finally:
        connection.close()
    export_snapshot()
    print(f"Deleted product: {external_id}")


def load_snapshot() -> List[Dict[str, Any]]:
    """Reads the JSON snapshot — used by the ad generator when no DB exists."""
    try:
        with open(SNAPSHOT_PATH, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        return []
