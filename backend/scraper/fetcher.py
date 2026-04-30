import httpx
import os
from typing import List, Dict, Any

SAMPLE_PRODUCTS = [
    {
        'external_id': 'LAPTOP-001',
        'name': 'Apple MacBook Pro 14" M3 Pro',
        'description': 'Das MacBook Pro mit M3 Pro Chip bietet enorme Leistung für Profis. 18GB RAM, 512GB SSD, Space Black.',
        'price': 1999.00,
        'original_price': 2249.00,
        'affiliate_url': 'https://amzn.to/example-macbook',
        'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'category': 'laptops',
        'brand': 'Apple',
        'rating': 4.8,
        'review_count': 234
    },
    {
        'external_id': 'LAPTOP-002',
        'name': 'ASUS ROG Strix G16 Gaming Laptop',
        'description': 'Gaming-Laptop mit Intel Core i7-13650HX, NVIDIA RTX 4070, 16GB DDR5, 512GB SSD.',
        'price': 1499.00,
        'original_price': 1799.00,
        'affiliate_url': 'https://amzn.to/example-rog',
        'image_url': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
        'category': 'gaming',
        'brand': 'ASUS',
        'rating': 4.6,
        'review_count': 156
    },
    {
        'external_id': 'LAPTOP-003',
        'name': 'Lenovo ThinkPad X1 Carbon Gen 11',
        'description': 'Ultraleichtes Business-Notebook mit Intel Core i7-1365U, 16GB RAM, 512GB SSD.',
        'price': 1699.00,
        'original_price': 1999.00,
        'affiliate_url': 'https://amzn.to/example-thinkpad',
        'image_url': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        'category': 'laptops',
        'brand': 'Lenovo',
        'rating': 4.7,
        'review_count': 89
    },
    {
        'external_id': 'PHONE-001',
        'name': 'Samsung Galaxy S24 Ultra',
        'description': 'Premium-Smartphone mit 256GB, Titanium Gray, inkl. Galaxy AI Features.',
        'price': 1399.00,
        'original_price': 1499.00,
        'affiliate_url': 'https://amzn.to/example-s24',
        'image_url': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
        'category': 'smartphones',
        'brand': 'Samsung',
        'rating': 4.9,
        'review_count': 412
    },
    {
        'external_id': 'PHONE-002',
        'name': 'Apple iPhone 15 Pro Max 256GB',
        'description': 'Das ultimative iPhone mit A17 Pro Chip, Titanium-Design und 5x Optical Zoom.',
        'price': 1199.00,
        'original_price': 1399.00,
        'affiliate_url': 'https://amzn.to/example-iphone15',
        'image_url': 'https://images.unsplash.com/photo-1695043133149-9cb9074a2d4a?w=800',
        'category': 'smartphones',
        'brand': 'Apple',
        'rating': 4.8,
        'review_count': 567
    },
    {
        'external_id': 'PHONE-003',
        'name': 'Google Pixel 8 Pro',
        'description': 'Das AI-Smartphone mit Tensor G3 Chip, 128GB, Obsidian. 7 Jahre Updates.',
        'price': 899.00,
        'original_price': 999.00,
        'affiliate_url': 'https://amzn.to/example-pixel8',
        'image_url': 'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800',
        'category': 'smartphones',
        'brand': 'Google',
        'rating': 4.7,
        'review_count': 234
    },
    {
        'external_id': 'GAMING-001',
        'name': 'Sony PlayStation 5 Slim',
        'description': 'Die neue slim Version der PS5 mit 1TB SSD, inkl. DualSense Controller.',
        'price': 449.00,
        'original_price': 499.00,
        'affiliate_url': 'https://amzn.to/example-ps5',
        'image_url': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
        'category': 'gaming',
        'brand': 'Sony',
        'rating': 4.9,
        'review_count': 1023
    },
    {
        'external_id': 'GAMING-002',
        'name': 'Xbox Series X',
        'description': 'Die stärkste Xbox aller Zeiten mit 1TB SSD, 4K/120fps Gaming.',
        'price': 449.00,
        'original_price': 499.00,
        'affiliate_url': 'https://amzn.to/example-xbox',
        'image_url': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
        'category': 'gaming',
        'brand': 'Microsoft',
        'rating': 4.8,
        'review_count': 892
    },
    {
        'external_id': 'ACC-001',
        'name': 'Logitech MX Master 3S',
        'description': 'Premium kabellose Maus mit 8K DPI Sensor, leise Klicks, USB-C aufladbar.',
        'price': 89.99,
        'original_price': 99.99,
        'affiliate_url': 'https://amzn.to/example-mxmaster',
        'image_url': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
        'category': 'zubehoer',
        'brand': 'Logitech',
        'rating': 4.8,
        'review_count': 1245
    },
    {
        'external_id': 'ACC-002',
        'name': 'Apple AirPods Pro (2. Gen)',
        'description': 'Aktive Geräuschunterdrückung, adaptive Transparenz, MagSafe Ladecase.',
        'price': 229.00,
        'original_price': 279.00,
        'affiliate_url': 'https://amzn.to/example-airpods',
        'image_url': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
        'category': 'zubehoer',
        'brand': 'Apple',
        'rating': 4.7,
        'review_count': 2134
    },
    {
        'external_id': 'LAPTOP-004',
        'name': 'Dell XPS 15',
        'description': '15.6" OLED Display, Intel Core i7-13700H, 32GB RAM, 1TB SSD, NVIDIA RTX 4050.',
        'price': 1899.00,
        'original_price': 2199.00,
        'affiliate_url': 'https://amzn.to/example-xps15',
        'image_url': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
        'category': 'laptops',
        'brand': 'Dell',
        'rating': 4.6,
        'review_count': 178
    },
    {
        'external_id': 'GAMING-003',
        'name': 'Nintendo Switch OLED',
        'description': 'OLED Display mit breiterem Farbspektrum, 64GB Speicher, Ethernet-Port.',
        'price': 349.00,
        'original_price': 379.00,
        'affiliate_url': 'https://amzn.to/example-switch',
        'image_url': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
        'category': 'gaming',
        'brand': 'Nintendo',
        'rating': 4.8,
        'review_count': 756
    }
]

async def fetch_products() -> List[Dict[str, Any]]:
    """
    Fetch products from affiliate network API.
    In production, replace with actual API calls to:
    - Amazon Associates API
    - Awin API
    - TradeTracker API
    - etc.
    """
    api_url = os.getenv('AFFILIATE_API_URL')
    api_key = os.getenv('AFFILIATE_API_KEY')

    if api_url and api_key:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                api_url,
                headers={'Authorization': f'Bearer {api_key}'},
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json().get('products', [])
            else:
                print(f"API error: {response.status_code}")

    print("Using sample products for demo")
    return SAMPLE_PRODUCTS.copy()