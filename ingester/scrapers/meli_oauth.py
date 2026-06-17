"""
meli_oauth.py — Mercado Libre API con App Token
Registrá tu app en: https://developers.mercadolibre.com.ar/es_ar/registra-tu-aplicacion
Requiere: MELI_ACCESS_TOKEN en env vars (o MELI_CLIENT_ID + MELI_CLIENT_SECRET)
"""
import httpx
import os
from typing import Optional

ACCESS_TOKEN = os.environ.get("MELI_ACCESS_TOKEN", "")
BASE = "https://api.mercadolibre.com"
SITE = "MLA"

HEADERS = {
    "User-Agent": "AgentShop/1.0",
    "Accept": "application/json",
}


def search_products(query: str, limit: int = 10) -> list[dict]:
    if not ACCESS_TOKEN:
        print("[meli] Sin MELI_ACCESS_TOKEN — saltando")
        return []
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {ACCESS_TOKEN}"}
        r = httpx.get(
            f"{BASE}/sites/{SITE}/search",
            params={"q": query, "limit": limit, "condition": "new"},
            headers=headers,
            timeout=10,
        )
        r.raise_for_status()
        items = r.json().get("results", [])
        return [_normalize(i) for i in items]
    except Exception as e:
        print(f"[meli_oauth] Error: {e}")
        return []


def _normalize(item: dict) -> dict:
    shipping = item.get("shipping") or {}
    tags = item.get("tags") or []
    return {
        "source": "meli",
        "seller_name": item.get("seller", {}).get("nickname", "Vendedor MELI"),
        "title": item.get("title", ""),
        "brand": _get_attr(item, "BRAND"),
        "category": item.get("category_id", ""),
        "image_url": item.get("thumbnail", "").replace("-I.jpg", "-O.jpg"),
        "url": item.get("permalink", ""),
        "price": float(item.get("price") or 0),
        "currency": "ARS",
        "shipping_cost": 0 if shipping.get("free_shipping") else None,
        "shipping_days": 1 if "fulfillment" in shipping.get("logistic_type", "") else 3,
        "warranty": _get_warranty(item),
        "seller_reputation": 0.88,
        "gmb_rating": None,
        "gmb_verified": False,
        "stock_available": item.get("available_quantity", 0) > 0,
        "sku": str(item.get("id", "")),
        "installments": None,
        "installments_rate": None,
        "is_official_store": "official_store" in tags,
    }


def _get_attr(item: dict, attr_id: str) -> str:
    for a in (item.get("attributes") or []):
        if a.get("id") == attr_id:
            return a.get("value_name") or ""
    return ""


def _get_warranty(item: dict) -> str:
    for a in (item.get("attributes") or []):
        if "warranty" in (a.get("id") or "").lower():
            return a.get("value_name") or "Sin dato"
    return "Sin dato"
