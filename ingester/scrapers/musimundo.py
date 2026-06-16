"""
musimundo.py — JSON-LD scraper para musimundo.com
"""
import httpx, json, re
from typing import Optional
from bs4 import BeautifulSoup

BASE = "https://www.musimundo.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AgentShopBot/1.0; +https://agentshop.ar/bot)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "es-AR,es;q=0.9",
}


def search_products(query: str, limit: int = 10) -> list[dict]:
    try:
        url = f"{BASE}/search?q={query.replace(' ', '+')}"
        r = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        products = _parse_jsonld(soup) or _parse_next_data(soup) or _parse_html_cards(soup)
        return products[:limit]
    except Exception as e:
        print(f"[musimundo] falló: {e}")
        return []


def _parse_jsonld(soup) -> list[dict]:
    products = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get("@type") == "Product":
                    p = _norm_jsonld(item)
                    if p: products.append(p)
        except Exception:
            continue
    return products


def _parse_next_data(soup) -> list[dict]:
    nd = soup.find("script", id="__NEXT_DATA__")
    if not nd: return []
    try:
        data = json.loads(nd.string)
        # Musimundo usa Next.js — buscar products en pageProps
        props = data.get("props", {}).get("pageProps", {})
        items = (
            props.get("products") or
            props.get("searchResult", {}).get("products") or
            props.get("data", {}).get("products") or []
        )
        return [_norm_next(i) for i in items if i]
    except Exception:
        return []


def _parse_html_cards(soup) -> list[dict]:
    cards = soup.select(".product-card, [data-testid='product-card'], article.product, .item-card")
    products = []
    for card in cards:
        title_el = card.select_one("h2, h3, .product-name, .item-name")
        price_el = card.select_one(".price, .product-price, [data-price]")
        link_el = card.select_one("a[href]")
        img_el = card.select_one("img")
        title = title_el.get_text(strip=True) if title_el else ""
        price = _xprice(price_el.get_text(strip=True) if price_el else "")
        if not title or not price: continue
        products.append({
            "source": "musimundo",
            "seller_name": "Musimundo",
            "title": title,
            "brand": "",
            "category": "",
            "image_url": img_el.get("src") or img_el.get("data-src") or "" if img_el else "",
            "url": _burl(link_el["href"]) if link_el else "",
            "price": price,
            "currency": "ARS",
            "shipping_cost": 0 if price and price >= 60000 else None,
            "shipping_days": 4,
            "warranty": "12 meses",
            "seller_reputation": 0.78,
            "gmb_rating": 3.6,
            "gmb_verified": True,
            "stock_available": True,
            "sku": "",
        })
    return products


def _norm_jsonld(item: dict) -> Optional[dict]:
    offers = item.get("offers") or {}
    if isinstance(offers, list): offers = offers[0] if offers else {}
    price = _xprice(offers.get("price"))
    if not price: return None
    return {
        "source": "musimundo",
        "seller_name": "Musimundo",
        "title": item.get("name") or "",
        "brand": (item.get("brand") or {}).get("name") or item.get("brand") or "",
        "category": item.get("category") or "",
        "image_url": item.get("image") or "",
        "url": offers.get("url") or item.get("url") or "",
        "price": price,
        "currency": offers.get("priceCurrency") or "ARS",
        "shipping_cost": 0 if price >= 60000 else None,
        "shipping_days": 4,
        "warranty": "12 meses",
        "seller_reputation": 0.78,
        "gmb_rating": 3.6,
        "gmb_verified": True,
        "stock_available": "InStock" in (offers.get("availability") or ""),
        "sku": item.get("sku") or "",
    }


def _norm_next(item: dict) -> dict:
    price = _xprice(item.get("price") or item.get("salePrice"))
    return {
        "source": "musimundo",
        "seller_name": "Musimundo",
        "title": item.get("name") or item.get("title") or "",
        "brand": item.get("brand") or "",
        "category": item.get("category") or "",
        "image_url": item.get("image") or item.get("thumbnail") or "",
        "url": _burl(item.get("url") or item.get("slug") or ""),
        "price": price,
        "currency": "ARS",
        "shipping_cost": 0 if price and price >= 60000 else None,
        "shipping_days": 4,
        "warranty": "12 meses",
        "seller_reputation": 0.78,
        "gmb_rating": 3.6,
        "gmb_verified": True,
        "stock_available": item.get("available", True),
        "sku": str(item.get("sku") or item.get("id") or ""),
    }


def _xprice(v) -> Optional[float]:
    if v is None: return None
    if isinstance(v, (int, float)): return float(v)
    c = re.sub(r"[^\d,.]", "", str(v)).replace(".", "").replace(",", ".")
    try: return float(c)
    except: return None

def _burl(p: str) -> str:
    if not p: return ""
    return p if p.startswith("http") else f"{BASE}/{p.lstrip('/')}"


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "smart tv"
    print(f"[musimundo] Buscando: {q}")
    print(json.dumps(search_products(q, 3), indent=2, ensure_ascii=False))
