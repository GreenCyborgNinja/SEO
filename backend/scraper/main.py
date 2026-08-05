"""Product sync entry point.

    python main.py            # fetch from RapidAPI, upsert into SQLite, export snapshot
    python main.py --dry-run  # fetch and report, write nothing

Without RAPIDAPI_KEY this exits successfully without touching the database — the
shop keeps serving whatever is already in it.
"""

import asyncio
import os
import sys
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

# Imported after load_dotenv so the modules see RAPIDAPI_KEY.
from db import count_products, export_snapshot, now_iso, record_sync_run, upsert_products  # noqa: E402
from fetcher import fetch_products  # noqa: E402
from rapidapi_client import usage  # noqa: E402


async def main() -> int:
    started_at = now_iso()
    dry_run = "--dry-run" in sys.argv
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Starting product sync via RapidAPI...")

    if not os.getenv("RAPIDAPI_KEY"):
        print("RAPIDAPI_KEY is not set — skipping the fetch, the database stays unchanged.")
        print("Set it in backend/.env to pull fresh data (see backend/.env.example).")
        return 0

    try:
        products = await fetch_products()
    except Exception as exc:  # noqa: BLE001 — report and log, never crash the pipeline
        print(f"ERROR: fetch failed: {exc}")
        record_sync_run("rapidapi", started_at, 0, usage.calls, usage.remaining, "error", str(exc))
        return 1

    print(f"\nFetched {len(products)} products")
    if not products:
        print("Nothing fetched — database left unchanged.")
        record_sync_run("rapidapi", started_at, 0, usage.calls, usage.remaining, "empty")
        return 0

    if dry_run:
        print("--dry-run: not writing to the database.")
        for product in products[:5]:
            print(f"  {product['external_id']}  {product['category']:<18} {product['name'][:60]}")
        return 0

    upserted = upsert_products(products)
    exported = export_snapshot()

    print(f"Upserted {upserted} products (database now holds {count_products()})")
    print(f"Exported {exported} products to the JSON snapshot")

    record_sync_run("rapidapi", started_at, upserted, usage.calls, usage.remaining, "ok")

    print("\nNext steps:")
    print("  cd frontend && npm run ai:descriptions   # copy for new products")
    print("  cd frontend && npm run ai:similar        # refresh recommendations")
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Sync complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
