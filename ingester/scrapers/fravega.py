"""
Frávega scraper — extrae productos vía JSON-LD + API interna
Corre como script standalone o importado desde ingest.py
"""
import httpx
import json
import re
from typing import Optional
from bs4 import BeautifulSoup

BASE_URL = "https://www.fravega.com"
SEARCH_API = "https://www.fravega.com/api/search"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AgentShopBot/1.0; +https://agentshop.ar/bot)",
    "Accept": "application/json, text/html",
    "Accept-Language": "es-AR,es;q=0.9",
}


def search_products(query: str, limit: int = 10) -> list[dict]:
    """
    Busca productos en Frávega. Primero intenta la API interna,
    fallback a scraping HTML + JSON-LD.
    """
    results = _search_via_api(query, limit)
    if not results:
        results = _search_via_html(query, limit)
    return results


def _search_via_api(query: str, limit: int) -> list[dict]:
    """Intenta la API interna de Frávega (puede cambiar sin aviso)."""
    try:
        params = {
            "q": query,
            "page": 1,
            "pageSize": limit,
            "sort": "relevance",
        }
        r = httpx.get(
            SEARCH_API,
            params=params,
            headers=HEADERS,
            timeout=10,
            follow_redirects=True,
        )
        r.raise_for_status()
        data = r.json()

        items = data.get("results") or data.get("products") or data.get("items") or []
        return [_normalize_api_item(i) for i in items[:limit] if i]

    except Exception as e:
        print(f"[fravega] API falló: {e} — intentando HTML scraping")
        return []


def _search_via_html(query: str, limit: int) -> list[dict]:
    """Scraping HTML + JSON-LD como fallback."""
    try:
        url = f"{BASE_URL}/buscar/?q={query.replace(' ', '+')}"
        r = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()

        soup = BeautifulSoup(r.text, "html.parser")
        products = []

        # JSON-LD estructurado (lo más limpio)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
                if isinstance(data, list):
                    for item in data:
                        if item.get("@type") in ("Product", "ItemList"):
                            products.append(_normalize_jsonld(item))
                elif data.get("@type") == "Product":
                    products.append(_normalize_jsonld(data))
            except Exception:
                continue

        # Fallback: cards HTML si no hay JSON-LD
        if not products:
            cards = soup.select("[data-testid='product-card'], .product-card, article.product")
            for card in cards[:limit]:
                p = _parse_card(card)
                if p:
                    products.append(p)

        return products[:limit]

    except Exception as e:
        print(f"[fravega] HTML scraping falló: {e}")
        return []


def _normalize_api_item(item: dict) -> dict:
    """Normaliza item de la API interna al schema de offers."""
    price = _extract_price(item.get("price") or item.get("salePrice") or item.get("priceWithTax"))
    return {
        "source": "fravega",
        "seller_name": "Frávega",
        "title": item.get("name") or item.get("title") or "",
        "brand": item.get("brand") or item.get("brandName") or "",
        "category": item.get("category") or item.get("categoryName") or "",
        "image_url": item.get("image") or item.get("thumbnail") or "",
        "url": _build_url(item.get("url") or item.get("slug") or item.get("id")),
        "price": price,
        "currency": "ARS",
        "shipping_cost": 0 if price and price >= 50000 else None,  # Frávega: envío gratis >$50k aprox
        "shipping_days": 3,
        "warranty": item.get("warranty") or "12 meses",
        "seller_reputation": 0.85,  # Frávega: reputación fija alta (tienda oficial)
        "gmb_rating": 3.8,          # Rating real de GMB Frávega AR (promedio nacional)
        "gmb_verified": True,
        "stock_available": item.get("available", True),
        "sku": str(item.get("sku") or item.get("id") or ""),
    }


def _normalize_jsonld(item: dict) -> dict:
    """Normaliza JSON-LD Product al schema de offers."""
    offers = item.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}

    price = _extract_price(offers.get("price") or offers.get("lowPrice"))
    return {
        "source": "fravega",
        "seller_name": "Frávega",
        "title": item.get("name") or "",
        "brand": (item.get("brand") or {}).get("name") if isinstance(item.get("brand"), dict) else item.get("brand") or "",
        "category": item.get("category") or "",
        "image_url": item.get("image") or "",
        "url": offers.get("url") or item.get("url") or "",
        "price": price,
        "currency": offers.get("priceCurrency") or "ARS",
        "shipping_cost": 0 if price and price >= 50000 else None,
        "shipping_days": 3,
        "warranty": _find_warranty(item),
        "seller_reputation": 0.85,
        "gmb_rating": 3.8,
        "gmb_verified": True,
        "stock_available": offers.get("availability", "").endswith("InStock"),
        "sku": item.get("sku") or item.get("productID") or "",
    }


def _parse_card(card) -> Optional[dict]:
    """Parsea card HTML genérica — último recurso."""
    try:
        title_el = card.select_one("h2, h3, .product-title, [data-testid='product-name']")
        price_el = card.select_one(".price, [data-testid='product-price'], .product-price")
        img_el = card.select_one("img")
        link_el = card.select_one("a[href]")

        title = title_el.get_text(strip=True) if title_el else ""
        price = _extract_price(price_el.get_text(strip=True) if price_el else "")
        if not title or not price:
            return None

        return {
            "source": "fravega",
            "seller_name": "Frávega",
            "title": title,
            "brand": "",
            "category": "",
            "image_url": img_el.get("src") or img_el.get("data-src") or "" if img_el else "",
            "url": _build_url(link_el["href"]) if link_el else "",
            "price": price,
            "currency": "ARS",
            "shipping_cost": 0 if price >= 50000 else None,
            "shipping_days": 3,
            "warranty": "12 meses",
            "seller_reputation": 0.85,
            "gmb_rating": 3.8,
            "gmb_verified": True,
            "stock_available": True,
            "sku": "",
        }
    except Exception:
        return None


def _extract_price(value) -> Optional[float]:
    """Extrae precio numérico de string o número."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = re.sub(r"[^\d,.]", "", str(value))
    # Argentina usa punto como separador de miles y coma como decimal
    cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except Exception:
        return None


def _build_url(path: Optional[str]) -> str:
    if not path:
        return ""
    if path.startswith("http"):
        return path
    return f"{BASE_URL}/{path.lstrip('/')}"


def _find_warranty(item: dict) -> str:
    for prop in item.get("additionalProperty", []):
        if "garantia" in (prop.get("name") or "").lower():
            return prop.get("value") or "12 meses"
    return "12 meses"


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "auriculares inalambricos"
    print(f"[fravega] Buscando: {q}")
    results = search_products(q, limit=5)
    print(json.dumps(results, indent=2, ensure_ascii=False))
