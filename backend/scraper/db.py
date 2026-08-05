"""SQLite writer for the scraper.

Replaces the old "dump everything into a JSON file" storage. The JSON is still
written, but now as a portable snapshot exported *from* the database, so the
git-tracked file and the live data cannot drift apart.

Concurrency: WAL + busy_timeout let the Next.js server keep reading while this
process writes. Transactions stay short (one bulk upsert per run).
"""

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from paths import SNAPSHOT_PATH, resolve_db_path
from taxonomy import assign_category

# Columns the scraper is allowed to touch. Notably absent: description /
# seo_description / description_source — those are owned by the AI generator and
# must survive a re-scrape.
_UPSERT_SQL = """
INSERT INTO products (
    id, external_id, name, description, seo_description, description_source,
    price, original_price, affiliate_url, image_url, category, brand,
    rating, review_count, created_at, updated_at
) VALUES (
    :id, :external_id, :name, NULL, NULL, NULL,
    :price, :original_price, :affiliate_url, :image_url, :category, :brand,
    :rating, :review_count, :now, :now
)
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    price = excluded.price,
    original_price = excluded.original_price,
    affiliate_url = excluded.affiliate_url,
    image_url = excluded.image_url,
    -- Never fall back to NULL: a scrape without a category must not wipe one.
    category = coalesce(excluded.category, products.category),
    brand = coalesce(excluded.brand, products.brand),
    rating = coalesce(excluded.rating, products.rating),
    review_count = max(excluded.review_count, products.review_count),
    updated_at = excluded.updated_at
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    path = resolve_db_path()
    if not os.path.exists(path):
        raise RuntimeError(
            f"Database not found at {path}.\n"
            "Create it first from the frontend directory: npm run db:push && npm run db:seed"
        )
    connection = sqlite3.connect(path, timeout=10.0)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode = WAL")
    connection.execute("PRAGMA busy_timeout = 5000")
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def upsert_products(products: List[Dict[str, Any]]) -> int:
    """Bulk upsert in a single short transaction. Returns rows written."""
    if not products:
        return 0

    timestamp = now_iso()
    rows = []
    seen = set()

    for product in products:
        external_id = (product.get("external_id") or "").strip()
        name = product.get("name")
        price = product.get("price")
        if not external_id or not name or price is None or external_id in seen:
            continue
        seen.add(external_id)

        original_price = product.get("original_price")
        rows.append(
            {
                "id": external_id,
                "external_id": external_id,
                "name": name,
                "price": float(price),
                "original_price": float(original_price)
                if original_price and float(original_price) > float(price)
                else None,
                "affiliate_url": product.get("affiliate_url") or f"https://www.amazon.de/dp/{external_id}",
                "image_url": product.get("image_url"),
                "category": product.get("category") or assign_category(name, product.get("brand")),
                "brand": product.get("brand"),
                "rating": product.get("rating"),
                "review_count": int(product.get("review_count") or 0),
                "now": timestamp,
            }
        )

    connection = connect()
    try:
        with connection:
            connection.executemany(_UPSERT_SQL, rows)
    finally:
        connection.close()

    return len(rows)


def export_snapshot(path: str = SNAPSHOT_PATH) -> int:
    """Writes the catalogue to the git-tracked JSON snapshot."""
    connection = connect()
    try:
        rows = connection.execute(
            """
            SELECT id, external_id, name, description, seo_description, description_source,
                   price, original_price, affiliate_url, image_url, category, brand,
                   rating, review_count, created_at, updated_at
            FROM products ORDER BY id
            """
        ).fetchall()
    finally:
        connection.close()

    if not rows:
        print("  ! snapshot not written: the products table is empty")
        return 0

    with open(path, "w", encoding="utf-8") as handle:
        json.dump([dict(row) for row in rows], handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    return len(rows)


def record_sync_run(
    source: str,
    started_at: str,
    products_upserted: int,
    api_calls: int,
    rate_limit_remaining: Optional[int],
    status: str,
    error: Optional[str] = None,
) -> None:
    """Run log — makes it visible in the DB whether the last sync actually worked."""
    connection = connect()
    try:
        with connection:
            connection.execute(
                """
                INSERT INTO sync_runs (
                    id, source, started_at, finished_at, products_upserted,
                    api_calls, rate_limit_remaining, status, error
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(uuid.uuid4()),
                    source,
                    started_at,
                    now_iso(),
                    products_upserted,
                    api_calls,
                    rate_limit_remaining,
                    status,
                    error,
                ),
            )
    except sqlite3.Error as exc:  # a broken log must not fail the sync
        print(f"  ! could not record sync run: {exc}")
    finally:
        connection.close()


def count_products() -> int:
    connection = connect()
    try:
        return connection.execute("SELECT count(*) AS c FROM products").fetchone()["c"]
    finally:
        connection.close()
