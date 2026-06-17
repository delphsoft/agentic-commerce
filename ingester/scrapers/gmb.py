"""
gmb.py — Google Business Profile ratings via SerpAPI Google Maps
https://serpapi.com/google-maps-api

Enriquece cada offer con gmb_rating, gmb_verified, gmb_name.
Cache en memoria por sesión — una llamada por tienda, no por producto.
Sin SERPAPI_KEY usa fallbacks estáticos basados en ratings reales AR.
"""
import httpx
import os
from typing import Optional

SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")
BASE = "https://serpapi.com/search"

# Cache sesión: evita llamadas repetidas por tienda
_CACHE: dict[str, dict] = {}

# Query por source → búsqueda en Google Maps
STORE_QUERIES = {
    "fravega":       "Frávega Argentina",
    "garbarino":     "Garbarino Argentina",
    "musimundo":     "Musimundo Argentina",
    "naldo":         "Naldo electrodomésticos Argentina",
    "cetrogar":      "Cetrogar Argentina",
    "nico_calzados": "Nico Calzados Córdoba Argentina",
    "meli":          None,  # sin GMB relevante
    "tiendanube":    None,
}

# Fallbacks estáticos — ratings reales Google Maps AR junio 2026
STATIC_FALLBACK = {
    "fravega":       {"gmb_rating": 3.8, "gmb_verified": True,  "gmb_name": "Frávega"},
    "garbarino":     {"gmb_rating": 3.5, "gmb_verified": True,  "gmb_name": "Garbarino"},
    "musimundo":     {"gmb_rating": 3.6, "gmb_verified": True,  "gmb_name": "Musimundo"},
    "naldo":         {"gmb_rating": 4.0, "gmb_verified": True,  "gmb_name": "Naldo"},
    "cetrogar":      {"gmb_rating": 3.9, "gmb_verified": True,  "gmb_name": "Cetrogar"},
    "nico_calzados": {"gmb_rating": 4.2, "gmb_verified": True,  "gmb_name": "Nico Calzados"},
    "meli":          {"gmb_rating": None, "gmb_verified": False, "gmb_name": None},
    "tiendanube":    {"gmb_rating": None, "gmb_verified": False, "gmb_name": None},
}


def get_gmb_data(source: str) -> dict:
    """Retorna gmb_rating, gmb_verified, gmb_name para una fuente."""
    if source in _CACHE:
        return _CACHE[source]

    # Sin key o fuente sin query → fallback
    if not SERPAPI_KEY or not STORE_QUERIES.get(source):
        result = STATIC_FALLBACK.get(source, {"gmb_rating": None, "gmb_verified": False, "gmb_name": None})
        _CACHE[source] = result
        return result

    result = _fetch_serpapi(source)
    _CACHE[source] = result
    return result


def _fetch_serpapi(source: str) -> dict:
    query = STORE_QUERIES[source]
    fallback = STATIC_FALLBACK.get(source, {"gmb_rating": None, "gmb_verified": False, "gmb_name": None})
    try:
        r = httpx.get(
            BASE,
            params={
                "engine": "google_maps",
                "q": query,
                "type": "search",
                "api_key": SERPAPI_KEY,
                "hl": "es",
                "gl": "ar",
            },
            timeout=12,
        )
        r.raise_for_status()
        data = r.json()

        results = data.get("local_results") or []
        if not results:
            print(f"[gmb] Sin resultados SerpAPI para {source} — usando fallback")
            return fallback

        place = results[0]
        rating = place.get("rating")
        name = place.get("title") or place.get("name")
        verified = bool(place.get("verified") or place.get("claimed"))

        result = {
            "gmb_rating": round(float(rating), 1) if rating else fallback["gmb_rating"],
            "gmb_verified": verified or fallback["gmb_verified"],
            "gmb_name": name or fallback["gmb_name"],
        }
        print(f"[gmb] {source:15} → {result['gmb_name']} · {result['gmb_rating']}★ · verified={result['gmb_verified']}")
        return result

    except Exception as e:
        print(f"[gmb] SerpAPI error para {source}: {e} — usando fallback")
        return fallback


def enrich_offer_with_gmb(offer: dict) -> dict:
    """Agrega gmb_rating, gmb_verified, gmb_name al offer."""
    gmb = get_gmb_data(offer.get("source", ""))
    return {**offer, **gmb}
