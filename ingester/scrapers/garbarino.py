"""
Garbarino scraper — extrae productos vía JSON-LD + API interna
"""
import httpx
import json
import re
from typing import Optional
from bs4 import BeautifulSoup

BASE_URL = "https://www.garbarino.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AgentShopBot/1.0; +https://agentshop.ar/bot)",
    "Accept": "application/json, text/html",
    "Accept-Language": "es-AR,es;q=0.9",
}


def search_products(query: str, limit: int = 10) -> list[dict]:
    results = _search_via_html(query, limit)
    return results


def _search_via_html(query: str, limit: int) -> list[dict]:
    try:
        url = f"{BASE_URL}/s?q={query.replace(' ', '+')}"
        r = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()

        soup = BeautifulSoup(r.text, "html.parser")
        products = []

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if item.get("@type") == "Product":
                        p = _normalize_jsonld(item)
                        if p:
                            products.append(p)
            except Exception:
                continue

        # Fallback: Next.js __NEXT_DATA__
        if not products:
            next_data = soup.find("script", id="__NEXT_DATA__")
            if next_data:
                try:
                    nd = json.loads(next_data.string)
                    items = (
                        nd.get("props", {})
                        .get("pageProps", {})
                        .get("products")
                        or nd.get("props", {})
                        .get("pageProps", {})
                        .get("searchResults", {})
                        .get("products", [])
                    )
                    for item in items[:limit]:
                        p = _normalize_next_item(item)
                        if p:
                            products.append(p)
                except Exception:
                    pass

        return products[:limit]

    except Exception as e:
        print(f"[garbarino] Scraping falló: {e}")
        return []


def _normalize_jsonld(item: dict) -> Optional[dict]:
    offers = item.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}

    price = _extract_price(offers.get("price") or offers.get("lowPrice"))
    if not price:
        return None

    return {
        "source": "garbarino",
        "seller_name": "Garbarino",
        "title": item.get("name") or "",
        "brand": (item.get("brand") or {}).get("name") if isinstance(item.get("brand"), dict) else item.get("brand") or "",
        "category": item.get("category") or "",
        "image_url": item.get("image") or "",
        "url": offers.get("url") or item.get("url") or "",
        "price": price,
        "currency": offers.get("priceCurrency") or "ARS",
        "shipping_cost": 0 if price and price >= 80000 else None,
        "shipping_days": 4,
        "warranty": "12 meses",
        "seller_reputation": 0.80,
        "gmb_rating": 3.5,
        "gmb_verified": True,
        "stock_available": offers.get("availability", "").endswith("InStock"),
        "sku": item.get("sku") or "",
    }


def _normalize_next_item(item: dict) -> Optional[dict]:
    price = _extract_price(
        item.get("price") or item.get("salePrice") or item.get("priceWithTax")
    )
    if not price:
        return None

    slug = item.get("slug") or item.get("url") or item.get("id") or ""
    return {
        "source": "garbarino",
        "seller_name": "Garbarino",
        "title": item.get("name") or item.get("title") or "",
        "brand": item.get("brand") or item.get("brandName") or "",
        "category": item.get("category") or "",
        "image_url": item.get("image") or item.get("thumbnail") or "",
        "url": _build_url(str(slug)),
        "price": price,
        "currency": "ARS",
        "shipping_cost": 0 if price >= 80000 else None,
        "shipping_days": 4,
        "warranty": "12 meses",
        "seller_reputation": 0.80,
        "gmb_rating": 3.5,
        "gmb_verified": True,
        "stock_available": item.get("available", True),
        "sku": str(item.get("sku") or item.get("id") or ""),
    }


def _extract_price(value) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = re.sub(r"[^\d,.]", "", str(value))
    cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except Exception:
        return None


def _build_url(path: str) -> str:
    if not path:
        return ""
    if path.startswith("http"):
        return path
    return f"{BASE_URL}/{path.lstrip('/')}"


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "smart tv 55"
    print(f"[garbarino] Buscando: {q}")
    results = search_products(q, limit=5)
    print(json.dumps(results, indent=2, ensure_ascii=False))
