"""Category taxonomy — loaded from shared/taxonomy.json.

Single source of truth shared with the frontend
(frontend/lib/catalog/normalize.mjs). The scoring rules are mirrored there; keep
the two in sync when changing either.
"""

import json
import re
from functools import lru_cache
from typing import Any, Dict, List, Optional

from paths import TAXONOMY_PATH
from normalize import clean_text

HEAD_LENGTH = 45
HEAD_WEIGHT = 3
TAIL_WEIGHT = 1


@lru_cache(maxsize=1)
def load_taxonomy() -> tuple:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    return tuple(sorted(data["categories"], key=lambda entry: entry.get("order", 999)))


def fallback_slug() -> str:
    taxonomy = load_taxonomy()
    for category in taxonomy:
        if category.get("fallback"):
            return category["slug"]
    return taxonomy[-1]["slug"]


def slugs() -> List[str]:
    return [category["slug"] for category in load_taxonomy()]


def search_queries() -> List[Dict[str, Any]]:
    """Flattened search plan: [{query, pages, slug}, …] driven by the taxonomy."""
    plan = []
    for category in load_taxonomy():
        for entry in category.get("search_queries", []):
            plan.append({"query": entry["query"], "pages": entry.get("pages", 1), "slug": category["slug"]})
    return plan


def best_seller_categories() -> List[Dict[str, str]]:
    """Amazon best-seller category per taxonomy slug, de-duplicated."""
    seen = set()
    result = []
    for category in load_taxonomy():
        amazon = category.get("amazon_bestseller_category")
        if amazon and amazon not in seen:
            seen.add(amazon)
            result.append({"amazon_category": amazon, "slug": category["slug"]})
    return result


@lru_cache(maxsize=4096)
def _keyword_pattern(keyword: str) -> re.Pattern:
    # Must end on a word boundary (optional German plural), but may be preceded by
    # other letters — so "Ladekabel" matches "kabel" while "kabellos" does not.
    return re.compile(rf"{re.escape(keyword.lower())}(?:en|e|n|s)?(?![a-zäöüß])", re.IGNORECASE)


def assign_category(name: Optional[str], brand: Optional[str] = None, explicit: Optional[str] = None) -> str:
    """Score keyword hits; hits in the title head count triple. First-match
    scanning mislabels most products because Amazon titles are keyword soup."""
    valid = slugs()
    if explicit and explicit in valid:
        return explicit

    title = (clean_text(f"{name or ''} {brand or ''}") or "").lower()
    head = title[:HEAD_LENGTH]

    best, best_score = None, 0
    for category in load_taxonomy():
        score = 0
        for keyword in category.get("keywords", []):
            pattern = _keyword_pattern(keyword)
            if pattern.search(head):
                score += HEAD_WEIGHT
            elif pattern.search(title):
                score += TAIL_WEIGHT
        if score > best_score:
            best, best_score = category["slug"], score

    return best or fallback_slug()
