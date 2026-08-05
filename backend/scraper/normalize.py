"""Text and number normalisation for scraped product data.

The API returns HTML entities in titles (`15,6&quot;`), German-formatted prices
and ratings on two different scales. Cleaning here means the database only ever
holds display-ready values.
"""

import html
import re
from typing import Any, Optional

_TAG_RE = re.compile(r"<[^>]*>")
_WS_RE = re.compile(r"\s+")


def clean_text(value: Any) -> Optional[str]:
    """Decode entities, drop stray tags, collapse whitespace. Empty -> None."""
    if value is None:
        return None
    text = html.unescape(str(value))
    # Twice: Amazon occasionally double-encodes (&amp;quot;).
    text = html.unescape(text)
    text = _TAG_RE.sub(" ", text)
    text = _WS_RE.sub(" ", text).strip()
    return text or None


def parse_price(value: Any) -> Optional[float]:
    """Parse '379,99 €' / '1.299,00' / 42 into a float. Unparseable -> None."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, dict):
        return parse_price(value.get("amount")) if "amount" in value else None

    cleaned = re.sub(r"[^\d,.\-]", "", str(value))
    if not cleaned:
        return None
    if "," in cleaned:
        # German format: dot is the thousands separator.
        cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def parse_int(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, (int, float)):
        return int(value)
    try:
        return int(re.sub(r"[^\d]", "", str(value)) or 0)
    except (ValueError, TypeError):
        return 0


def normalize_rating(value: Any) -> Optional[float]:
    """Ratings arrive as 4.4 or 44 depending on the endpoint."""
    rating = parse_price(value)
    if rating is None or rating <= 0:
        return None
    if rating > 10:
        rating = rating / 10
    return round(min(rating, 5.0), 1)


_KNOWN_BRANDS = [
    "Lenovo", "HP", "Dell", "Acer", "ASUS", "Apple", "Samsung", "Xiaomi", "Huawei", "MSI",
    "Razer", "Logitech", "Corsair", "SteelSeries", "HyperX", "Sony", "Bose", "JBL", "Anker",
    "UGREEN", "Belkin", "SanDisk", "Seagate", "Crucial", "Kingston", "Western Digital",
    "Intenso", "TP-Link", "AVM", "Netgear", "Canon", "Epson", "Brother", "Nintendo",
    "Microsoft", "Google", "Motorola", "Nokia", "OnePlus", "Oppo", "Realme", "Nothing",
    "Medion", "LG", "Philips", "AOC", "BenQ", "Sennheiser", "Beats", "soundcore", "Garmin",
    "Fitbit", "Amazfit", "Trust", "Sharkoon", "Gigabyte", "AMD", "Intel", "NVIDIA",
]


def extract_brand(name: Optional[str], existing: Any = None) -> Optional[str]:
    """The /search endpoint never returns a brand, so recover it from the title."""
    cleaned_existing = clean_text(existing)
    if cleaned_existing:
        return cleaned_existing

    title = clean_text(name) or ""
    for brand in _KNOWN_BRANDS:
        if re.search(rf"(^|[^a-zA-Z]){re.escape(brand)}([^a-zA-Z]|$)", title, re.IGNORECASE):
            return brand

    first = re.split(r"[\s,|–-]+", title.strip())[0] if title else ""
    if 2 <= len(first) <= 18 and re.match(r"^[A-Za-zÄÖÜäöü][A-Za-z0-9ÄÖÜäöü!.&+]*$", first):
        return first
    return None
