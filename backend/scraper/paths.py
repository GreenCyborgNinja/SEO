"""Shared filesystem locations. Mirrors frontend/lib/db/paths.mjs."""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))

SNAPSHOT_PATH = os.path.join(BASE_DIR, "latest-products.json")
TAXONOMY_PATH = os.path.join(REPO_ROOT, "shared", "taxonomy.json")
CURATED_ADS_PATH = os.path.join(REPO_ROOT, "shared", "curated-ads.json")


def resolve_db_path() -> str:
    """Absolute path of the SQLite file.

    Honours DATABASE_PATH exactly like the Node side does (relative paths
    resolve against the repo root), so both processes always open the same file.
    """
    configured = os.getenv("DATABASE_PATH")
    if configured:
        target = configured if os.path.isabs(configured) else os.path.join(REPO_ROOT, configured)
    else:
        target = os.path.join(REPO_ROOT, "data", "daily-trends.db")

    os.makedirs(os.path.dirname(target), exist_ok=True)
    return target
