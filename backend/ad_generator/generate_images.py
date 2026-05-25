import json
import os
import math
from typing import Dict, Any, List, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CURATED_IDS = [
    "B0GR6PN6BH", "B0DDCSBL87", "B0DSGB8C6M", "B0F8F3NNS6",
    "B08369D1K4", "B07KP2FFVM", "B0C3HCD34R", "B0GSZT2NBN",
    "B0DZ754W6Y", "B0BRMNB4Y6", "B0CPM45WF7", "B0C5XPJBFB",
    "B0GFXMT71D", "B0CBCPB2T1", "B0DJWBDNCW",
]

SIZES = {
    "skyscraper_left": (160, 600),
    "skyscraper_right": (300, 600),
    "leaderboard": (728, 90),
    "medium_rectangle": (300, 250),
    "square": (1080, 1080),
}

COLORS = {
    "bg_start": (15, 23, 42),
    "bg_end": (30, 41, 59),
    "accent": (249, 115, 22),
    "success": (34, 197, 94),
    "text_white": (255, 255, 255),
    "text_muted": (100, 116, 139),
    "text_price": (249, 115, 22),
}


def lerp_color(c1: Tuple[int, int, int], c2: Tuple[int, int, int], t: float) -> Tuple[int, int, int]:
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def draw_gradient(draw: ImageDraw.ImageDraw, size: Tuple[int, int]):
    w, h = size
    for y in range(h):
        t = y / h
        color = lerp_color(COLORS["bg_start"], COLORS["bg_end"], t)
        draw.line([(0, y), (w, y)], fill=color)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", size)
    except (IOError, OSError):
        try:
            return ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", size)
        except (IOError, OSError):
            return ImageFont.load_default()


def load_font_bold(size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", size)
    except (IOError, OSError):
        try:
            return ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", size)
        except (IOError, OSError):
            return ImageFont.load_default()


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> List[str]:
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_rounded_rect(draw: ImageDraw.ImageDraw, xy: Tuple[int, int, int, int], radius: int, fill: Tuple[int, int, int]):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def generate_ad(product: Dict[str, Any], size: Tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)

    draw_gradient(draw, (w, h))

    savings = 0
    if product.get("original_price") and product.get("price"):
        savings = int(((product["original_price"] - product["price"]) / product["original_price"]) * 100)

    is_wide = w >= 300
    is_tall = h >= 250
    is_leaderboard = w >= 700 and h < 200
    is_skyscraper = h > w * 1.5
    is_square = w >= 1000

    if is_square:
        font_title = load_font_bold(48)
        font_price = load_font_bold(64)
        font_original = load_font(36)
        font_savings = load_font_bold(36)
        font_brand = load_font(24)
        font_cta = load_font_bold(32)
        badge_size = 80
        padding = 40
    elif is_leaderboard:
        font_title = load_font_bold(22)
        font_price = load_font_bold(28)
        font_original = load_font(18)
        font_savings = load_font_bold(18)
        font_brand = load_font(14)
        font_cta = load_font_bold(18)
        badge_size = 40
        padding = 12
    elif is_skyscraper:
        font_title = load_font_bold(18)
        font_price = load_font_bold(24)
        font_original = load_font(14)
        font_savings = load_font_bold(14)
        font_brand = load_font(11)
        font_cta = load_font_bold(14)
        badge_size = 32
        padding = 10
    elif is_tall:
        font_title = load_font_bold(20)
        font_price = load_font_bold(28)
        font_original = load_font(16)
        font_savings = load_font_bold(16)
        font_brand = load_font(12)
        font_cta = load_font_bold(16)
        badge_size = 36
        padding = 12
    else:
        font_title = load_font_bold(16)
        font_price = load_font_bold(20)
        font_original = load_font(12)
        font_savings = load_font_bold(12)
        font_brand = load_font(10)
        font_cta = load_font_bold(12)
        badge_size = 28
        padding = 8

    name = product.get("name", "")
    brand = product.get("brand") or name.split()[0] if name else ""
    price = product.get("price", 0)
    original_price = product.get("original_price")

    y = padding

    if savings > 0 and not is_leaderboard:
        badge_text = f"-{savings}%"
        bb = draw.textbbox((0, 0), badge_text, font=font_savings)
        bw = bb[2] - bb[0] + 20
        bh = bb[3] - bb[1] + 8
        bx = w - bw - padding
        by = y
        draw_rounded_rect(draw, (bx, by, bx + bw, by + bh), 8, COLORS["accent"])
        draw.text((bx + 10, by + 4), badge_text, fill=COLORS["text_white"], font=font_savings)

    if not is_leaderboard and brand:
        draw.text((padding, y), brand.upper(), fill=COLORS["text_muted"], font=font_brand)
        bb = draw.textbbox((0, 0), brand.upper(), font=font_brand)
        y += bb[3] - bb[1] + 4

    max_text_w = w - padding * 2
    if not is_leaderboard:
        name_lines = wrap_text(name, font_title, max_text_w, draw)
        max_lines = 2 if is_skyscraper else 3
        name_lines = name_lines[:max_lines]
        for line in name_lines:
            draw.text((padding, y), line, fill=COLORS["text_white"], font=font_title)
            bb = draw.textbbox((0, 0), line, font=font_title)
            y += bb[3] - bb[1] + 2
    else:
        short_name = name[:50] + "..." if len(name) > 50 else name
        draw.text((padding, y), short_name, fill=COLORS["text_white"], font=font_title)

    y += 6

    price_str = f"{price:.2f}".replace(".", ",") + " \u20AC"
    draw.text((padding, y), price_str, fill=COLORS["text_price"], font=font_price)
    pb = draw.textbbox((0, 0), price_str, font=font_price)
    price_w = pb[2] - pb[0]
    price_h = pb[3] - pb[1]

    if original_price and original_price > price:
        orig_str = f"{original_price:.2f}".replace(".", ",") + " \u20AC"
        ox = padding + price_w + 10
        oy = y + price_h - 18
        if oy < padding:
            oy = y
        draw.text((ox, oy), orig_str, fill=COLORS["text_muted"], font=font_original)
        ob = draw.textbbox((0, 0), orig_str, font=font_original)
        oh = ob[3] - ob[1]
        ly = oy + oh // 2
        draw.line([(ox, ly), (ox + (ob[2] - ob[0]), ly)], fill=COLORS["text_muted"], width=2)

    y = h - padding - 36
    if is_leaderboard:
        y = padding
        cta_x = w - padding - 120
        draw_rounded_rect(draw, (cta_x, y, cta_x + 110, y + 32), 6, COLORS["success"])
        draw.text((cta_x + 12, y + 4), "Zum Shop \u2192", fill=COLORS["text_white"], font=font_cta)
    elif is_square:
        cta_y = h - 100
        cta_w = 300
        cta_x = (w - cta_w) // 2
        draw_rounded_rect(draw, (cta_x, cta_y, cta_x + cta_w, cta_y + 56), 12, COLORS["success"])
        draw.text((cta_x + 50, cta_y + 10), "Jetzt kaufen \u2192", fill=COLORS["text_white"], font=font_cta)
    else:
        cta_w = min(w - padding * 2, 200)
        cta_h = 36
        cta_x = (w - cta_w) // 2
        draw_rounded_rect(draw, (cta_x, y, cta_x + cta_w, y + cta_h), 8, COLORS["success"])
        ct = "Jetzt kaufen \u2192" if is_tall else "Kaufen \u2192"
        ctb = draw.textbbox((0, 0), ct, font=font_cta)
        ctw = ctb[2] - ctb[0]
        ctx = (w - ctw) // 2
        draw.text((ctx, y + 6), ct, fill=COLORS["text_white"], font=font_cta)

    if is_square:
        draw.text((padding, h - 36), "Daily Trends", fill=COLORS["text_muted"], font=load_font(20))
        draw.text((w - padding - 100, h - 36), "Affiliate", fill=COLORS["text_muted"], font=load_font(14))

    return img


def load_products() -> List[Dict[str, Any]]:
    base = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base, "..", "scraper", "latest-products.json")
    if not os.path.exists(json_path):
        json_path = os.path.join(base, "curated-ads.json")

    with open(json_path, "r", encoding="utf-8") as f:
        all_products = json.load(f)

    if isinstance(all_products, list) and len(all_products) > 1:
        id_map = {p.get("external_id", ""): p for p in all_products}
        curated = [id_map[pid] for pid in CURATED_IDS if pid in id_map]
        if curated:
            return curated
        return all_products[:15]
    return all_products if isinstance(all_products, list) else []


def main():
    products = load_products()
    if not products:
        print("ERROR: No products found")
        return

    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    os.makedirs(output_dir, exist_ok=True)

    for product in products:
        pid = product.get("external_id", "unknown")
        name = product.get("name", "")[:30].replace(" ", "_")

        for size_name, size in SIZES.items():
            img = generate_ad(product, size)
            filename = f"{pid}_{size_name}.png"
            filepath = os.path.join(output_dir, filename)
            img.save(filepath)
            print(f"  Saved: {filename} ({size[0]}x{size[1]})")

    print(f"\nDone! Generated {len(products) * len(SIZES)} ad images in {output_dir}")


if __name__ == "__main__":
    main()
