"""
mercadolibre.py — API pública MLA (Argentina), sin auth para búsqueda básica
Docs: https://developers.mercadolibre.com/es_ar/items-y-busquedas
"""
import httpx
import json
from typing import Optional

BASE = "https://api.mercadolibre.com"
SITE = "MLA"  # Argentina

HEADERS = {
    "User-Agent": "AgentShopBot/1.0 (info@agentshop.ar)",
    "Accept": "application/json",
}


def search_products(query: str, limit: int = 10) -> list[dict]:
    """
    Búsqueda pública en MELI Argentina.
    Enriquece con reputación del vendedor vía /users/{id}.
    """
    items = _search(query, limit)
    enriched = []
    for item in items:
        seller_rep = _get_seller_reputation(item.get("seller", {}).get("id"))
        enriched.append(_normalize(item, seller_rep))
    return enriched


def _search(query: str, limit: int) -> list[dict]:
    try:
        r = httpx.get(
            f"{BASE}/sites/{SITE}/search",
            params={"q": query, "limit": limit, "condition": "new"},
            headers=HEADERS,
            timeout=10,
        )
        r.raise_for_status()
        return r.json().get("results", [])
    except Exception as e:
        print(f"[meli] search falló: {e}")
        return []


def _get_seller_reputation(seller_id: Optional[int]) -> Optional[dict]:
    """Obtiene reputación del vendedor. Termómetro: green/yellow/red."""
    if not seller_id:
        return None
    try:
        r = httpx.get(
            f"{BASE}/users/{seller_id}",
            headers=HEADERS,
            timeout=8,
        )
        r.raise_for_status()
        data = r.json()
        rep = data.get("seller_reputation") or {}
        return {
            "level": rep.get("level_id"),           # "5_green", "4_light_green", etc.
            "transactions": rep.get("transactions", {}).get("completed", 0),
            "positive_rate": _positive_rate(rep),
            "power_seller": data.get("tags", []) and "brand" in data.get("tags", []),
        }
    except Exception:
        return None


def _positive_rate(rep: dict) -> float:
    """Calcula tasa de feedback positivo."""
    ratings = rep.get("ratings") or {}
    pos = ratings.get("positive", 0) or 0
    neg = ratings.get("negative", 0) or 0
    neu = ratings.get("neutral", 0) or 0
    total = pos + neg + neu
    return round(pos / total, 3) if total > 0 else 0.0


def _level_to_score(level: Optional[str]) -> float:
    """Convierte nivel MELI a score 0-1."""
    mapping = {
        "5_green": 1.0,
        "4_light_green": 0.85,
        "3_yellow": 0.60,
        "2_orange": 0.35,
        "1_red": 0.10,
    }
    return mapping.get(level or "", 0.5)


def _shipping_free(item: dict) -> bool:
    shipping = item.get("shipping") or {}
    return shipping.get("free_shipping", False)


def _shipping_days(item: dict) -> Optional[int]:
    """Estima días de envío desde tags de MELI."""
    tags = item.get("tags") or []
    if "same_day_delivery" in tags:
        return 0
    if "immediate_delivery" in tags:
        return 1
    shipping = item.get("shipping") or {}
    if shipping.get("logistic_type") == "fulfillment":
        return 1  # MELI full = 1 día generalmente
    return 3  # default


def _warranty(item: dict) -> str:
    attrs = item.get("attributes") or []
    for a in attrs:
        if a.get("id") == "WARRANTY_TYPE" or "garantia" in (a.get("name") or "").lower():
            return a.get("value_name") or "Sin dato"
    return "Sin dato"


def _normalize(item: dict, seller_rep: Optional[dict]) -> dict:
    rep_score = _level_to_score(seller_rep.get("level") if seller_rep else None)
    # Ajuste extra por tasa de positivos
    if seller_rep and seller_rep.get("positive_rate"):
        rep_score = (rep_score + seller_rep["positive_rate"]) / 2

    # Vendedor oficial de marca → bonus
    is_official = "official_store" in (item.get("tags") or [])
    if is_official:
        rep_score = min(rep_score + 0.1, 1.0)

    return {
        "source": "meli",
        "seller_name": item.get("seller", {}).get("nickname") or "Vendedor MELI",
        "title": item.get("title") or "",
        "brand": _get_attr(item, "BRAND"),
        "category": item.get("category_id") or "",
        "image_url": item.get("thumbnail") or "",
        "url": item.get("permalink") or "",
        "price": float(item.get("price") or 0),
        "currency": item.get("currency_id") or "ARS",
        "shipping_cost": 0 if _shipping_free(item) else None,
        "shipping_days": _shipping_days(item),
        "warranty": _warranty(item),
        "seller_reputation": round(rep_score, 3),
        "gmb_rating": None,   # MELI no tiene GMB
        "gmb_verified": False,
        "stock_available": item.get("available_quantity", 0) > 0,
        "url_original": item.get("permalink") or "",
        "is_official_store": is_official,
        "meli_seller_level": seller_rep.get("level") if seller_rep else None,
        "meli_transactions": seller_rep.get("transactions") if seller_rep else None,
        "sku": str(item.get("id") or ""),
    }


def _get_attr(item: dict, attr_id: str) -> str:
    for a in (item.get("attributes") or []):
        if a.get("id") == attr_id:
            return a.get("value_name") or ""
    return ""


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "auriculares sony"
    print(f"[meli] Buscando: {q}")
    results = search_products(q, limit=3)
    print(json.dumps(results, indent=2, ensure_ascii=False))
