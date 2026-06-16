"""
tiendanube.py — scraping directo de tiendas Tiendanube conocidas
La API oficial de TN requiere OAuth por store, no sirve para buscar cross-stores.
En cambio, muchas tiendas TN exponen /search.json o JSON-LD estándar.

Para agregar nuevas tiendas: TIENDANUBE_STORES dict abajo.
"""
import httpx, json, re
from typing import Optional
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AgentShopBot/1.0; +https://agentshop.ar/bot)",
    "Accept": "text/html,application/json",
    "Accept-Language": "es-AR,es;q=0.9",
}

# Tiendas Tiendanube relevantes para Argentina
# Agregar más según el verticales que cubramos
TIENDANUBE_STORES = [
    {
        "key": "tn_tienda1",
        "name": "Tienda TN — Electrónica AR",
        "base": "https://www.electronicaar.com.ar",  # placeholder — reemplazar con real
        "category": "electronica",
        "gmb_rating": 4.0,
        "gmb_verified": False,
        "reputation": 0.70,
        "shipping_days": 5,
        "free_shipping_floor": 50000,
    },
    # Agregar tiendas reales acá:
    # {
    #   "key": "tn_marca_x",
    #   "name": "Marca X",
    #   "base": "https://www.marcax.com.ar",
    #   "category": "...",
    #   ...
    # },
]


def search_all_stores(query: str, limit_per_store: int = 5) -> list[dict]:
    """Busca en todas las tiendas TN configuradas."""
    results = []
    for store in TIENDANUBE_STORES:
        products = search_store(store, query, limit_per_store)
        results.extend(products)
    return results


def search_store(store: dict, query: str, limit: int = 10) -> list[dict]:
    """
    Intenta en orden:
    1. /search.json (Tiendanube nativo)
    2. JSON-LD en HTML
    3. __NEXT_DATA__ si hay Next.js
    """
    base = store["base"]
    q_enc = query.replace(" ", "+")

    # 1. API nativa TN: /search.json
    products = _try_search_json(base, query, store, limit)
    if products:
        return products[:limit]

    # 2. HTML scraping
    try:
        url = f"{base}/buscar?q={q_enc}"
        r = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        if r.status_code == 404:
            # Algunos templates usan /search
            url = f"{base}/search?q={q_enc}"
            r = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        products = (
            _parse_jsonld(soup, store) or
            _parse_next_data(soup, store) or
            _parse_tn_html(soup, store)
        )
        return products[:limit]
    except Exception as e:
        print(f"[tiendanube:{store['key']}] falló: {e}")
        return []


def _try_search_json(base: str, query: str, store: dict, limit: int) -> list[dict]:
    """
    Tiendanube expone /api/catalog/search?q= en algunas versiones
    y también /products.json en tiendas que tienen eso habilitado.
    """
    endpoints = [
        f"{base}/api/catalog/search?q={query.replace(' ', '+')}&per_page={limit}",
        f"{base}/products.json?q={query.replace(' ', '+')}",
    ]
    for url in endpoints:
        try:
            r = httpx.get(
                url,
                headers={**HEADERS, "Accept": "application/json"},
                timeout=8,
            )
            if r.status_code != 200: continue
            data = r.json()
            items = (
                data.get("products") or
                data.get("results") or
                data.get("items") or []
            )
            if items:
                return [_norm(i, store) for i in items[:limit] if i]
        except Exception:
            continue
    return []


def _parse_jsonld(soup, store: dict) -> list[dict]:
    products = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get("@type") == "Product":
                    p = _norm_jsonld(item, store)
                    if p: products.append(p)
        except Exception:
            continue
    return products


def _parse_next_data(soup, store: dict) -> list[dict]:
    nd = soup.find("script", id="__NEXT_DATA__")
    if not nd: return []
    try:
        data = json.loads(nd.string)
        props = data.get("props", {}).get("pageProps", {})
        items = (
            props.get("products") or
            props.get("searchResult", {}).get("products") or
            props.get("data", {}).get("products") or []
        )
        return [_norm(i, store) for i in items if i]
    except Exception:
        return []


def _parse_tn_html(soup, store: dict) -> list[dict]:
    """Cards HTML de Tiendanube — clases conocidas del tema base."""
    cards = soup.select(
        ".js-item-product, [data-js-item-product], "
        ".ProductGrid-item, .product-item, .item"
    )
    products = []
    for card in cards:
        title_el = card.select_one(
            ".js-item-name, .item-name, .ProductCard-title, h2, h3"
        )
        price_el = card.select_one(
            ".js-price-display, .item-price, .ProductCard-price, [data-price]"
        )
        link_el = card.select_one("a[href]")
        img_el = card.select_one("img")

        title = title_el.get_text(strip=True) if title_el else ""
        price = _xprice(price_el.get_text(strip=True) if price_el else "")
        if not title or not price: continue

        products.append(_make_offer(store, {
            "title": title,
            "price": price,
            "image_url": img_el.get("src") or img_el.get("data-src") or "" if img_el else "",
            "url": _burl(link_el["href"], store["base"]) if link_el else "",
        }))
    return products


def _norm_jsonld(item: dict, store: dict) -> Optional[dict]:
    offers = item.get("offers") or {}
    if isinstance(offers, list): offers = offers[0] if offers else {}
    price = _xprice(offers.get("price"))
    if not price: return None
    return _make_offer(store, {
        "title": item.get("name") or "",
        "brand": (item.get("brand") or {}).get("name") or "",
        "image_url": item.get("image") or "",
        "url": offers.get("url") or item.get("url") or "",
        "price": price,
        "stock_available": "InStock" in (offers.get("availability") or ""),
        "sku": item.get("sku") or "",
    })


def _norm(item: dict, store: dict) -> dict:
    price = _xprice(item.get("price") or item.get("promotional_price"))
    variants = item.get("variants") or []
    if variants and not price:
        price = _xprice(variants[0].get("price"))
    return _make_offer(store, {
        "title": item.get("name") or item.get("title") or "",
        "brand": item.get("brand") or "",
        "image_url": (item.get("images") or [{}])[0].get("src") or item.get("image") or "",
        "url": _burl(item.get("canonical_url") or item.get("url") or "", store["base"]),
        "price": price,
        "stock_available": item.get("published", True),
        "sku": str(item.get("sku") or item.get("id") or ""),
    })


def _make_offer(store: dict, data: dict) -> dict:
    price = data.get("price")
    return {
        "source": store["key"],
        "seller_name": store["name"],
        "title": data.get("title") or "",
        "brand": data.get("brand") or "",
        "category": store.get("category") or "",
        "image_url": data.get("image_url") or "",
        "url": data.get("url") or "",
        "price": price,
        "currency": "ARS",
        "shipping_cost": 0 if price and price >= store["free_shipping_floor"] else None,
        "shipping_days": store["shipping_days"],
        "warranty": "Sin dato",
        "seller_reputation": store["reputation"],
        "gmb_rating": store.get("gmb_rating"),
        "gmb_verified": store.get("gmb_verified", False),
        "stock_available": data.get("stock_available", True),
        "sku": data.get("sku") or "",
    }


def _xprice(v) -> Optional[float]:
    if v is None: return None
    if isinstance(v, (int, float)): return float(v)
    c = re.sub(r"[^\d,.]", "", str(v)).replace(".", "").replace(",", ".")
    try: return float(c)
    except: return None


def _burl(path: str, base: str) -> str:
    if not path: return ""
    return path if path.startswith("http") else f"{base}/{path.lstrip('/')}"


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "zapatillas"
    print(f"[tiendanube] Buscando en {len(TIENDANUBE_STORES)} tiendas: {q}")
    results = search_all_stores(q, limit_per_store=3)
    print(json.dumps(results, indent=2, ensure_ascii=False))
