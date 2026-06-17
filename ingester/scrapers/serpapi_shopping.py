"""
serpapi_shopping.py — Google Shopping via SerpAPI para Argentina
Docs: https://serpapi.com/google-shopping-api

Una sola fuente que reemplaza todos los scrapers que fallan por bloqueo.
Retorna productos con imagen, precio, tienda y URL directa.
"""
import httpx
import os
import re
from typing import Optional

SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")
BASE = "https://serpapi.com/search"


def search_products(query: str, limit: int = 10) -> list[dict]:
    if not SERPAPI_KEY:
        print("[serpapi] Sin SERPAPI_KEY — saltando")
        return []
    try:
        r = httpx.get(
            BASE,
            params={
                "engine": "google_shopping",
                "q": query,
                "location": "Argentina",
                "gl": "ar",
                "hl": "es",
                "currency": "ARS",
                "api_key": SERPAPI_KEY,
                "num": limit,
            },
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        results = data.get("shopping_results") or []
        print(f"[serpapi] '{query}' → {len(results)} resultados")
        return [_normalize(item) for item in results[:limit] if item.get("price")]
    except Exception as e:
        print(f"[serpapi] Error: {e}")
        return []


def _normalize(item: dict) -> dict:
    source = _detect_source(item.get("source", ""))
    price = _parse_price(item.get("price", ""))
    return {
        "source": source,
        "seller_name": item.get("source", ""),
        "title": item.get("title", ""),
        "brand": item.get("brand") or _extract_brand(item.get("title", "")),
        "category": "",
        "image_url": item.get("thumbnail") or item.get("image") or "",
        "url": item.get("link") or item.get("product_link") or "",
        "price": price,
        "currency": "ARS",
        "shipping_cost": 0 if "gratis" in (item.get("shipping") or "").lower() else None,
        "shipping_days": None,
        "warranty": None,
        "seller_reputation": _store_reputation(source),
        "gmb_rating": None,
        "gmb_verified": False,
        "stock_available": True,
        "sku": str(item.get("product_id") or item.get("position") or ""),
        "installments": None,
        "installments_rate": None,
        "is_official_store": source in ("fravega", "garbarino", "musimundo", "naldo", "cetrogar"),
    }


def _detect_source(seller: str) -> str:
    s = seller.lower()
    if "frávega" in s or "fravega" in s: return "fravega"
    if "garbarino" in s: return "garbarino"
    if "musimundo" in s: return "musimundo"
    if "naldo" in s: return "naldo"
    if "cetrogar" in s: return "cetrogar"
    if "nico calzados" in s or "nicocalzados" in s: return "nico_calzados"
    if "mercado libre" in s or "mercadolibre" in s: return "meli"
    return "google_shopping"


def _store_reputation(source: str) -> float:
    reps = {
        "fravega": 0.85, "garbarino": 0.80, "musimundo": 0.78,
        "naldo": 0.80, "cetrogar": 0.78, "nico_calzados": 0.72,
        "meli": 0.88, "google_shopping": 0.70,
    }
    return reps.get(source, 0.70)


def _parse_price(price_str: str) -> Optional[float]:
    if not price_str:
        return None
    cleaned = re.sub(r"[^\d,.]", "", str(price_str))
    cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except Exception:
        return None


def _extract_brand(title: str) -> str:
    brands = ["Samsung", "LG", "Sony", "Apple", "Motorola", "Xiaomi",
              "Lenovo", "HP", "Asus", "Adidas", "Nike", "Whirlpool",
              "Philips", "Rowenta", "Oster", "Electrolux", "Bosch"]
    for b in brands:
        if b.lower() in title.lower():
            return b
    return title.split()[0] if title else ""


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "auriculares inalambricos"
    results = search_products(q, 5)
    import json
    print(json.dumps(results, indent=2, ensure_ascii=False))
