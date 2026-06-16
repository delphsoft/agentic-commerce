"""
ar_retailers.py — scrapers para Naldo, Cetrogar y Nico Calzados
Todos usan la misma base: JSON-LD → Next.js data → HTML cards
"""
import httpx, json, re
from typing import Optional
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AgentShopBot/1.0; +https://agentshop.ar/bot)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "es-AR,es;q=0.9",
}

# ─── CONFIG POR TIENDA ────────────────────────────────────────────────────────
STORES = {
    "naldo": {
        "base": "https://www.naldo.com.ar",
        "search": "https://www.naldo.com.ar/search?q={q}",
        "seller_name": "Naldo",
        "reputation": 0.80,
        "gmb_rating": 4.0,
        "gmb_verified": True,
        "shipping_days": 4,
        "free_shipping_floor": 70000,
        "warranty_default": "12 meses",
        "category_hint": "electrodomésticos",
    },
    "cetrogar": {
        "base": "https://www.cetrogar.com.ar",
        "search": "https://www.cetrogar.com.ar/catalogsearch/result/?q={q}",
        "seller_name": "Cetrogar",
        "reputation": 0.78,
        "gmb_rating": 3.9,
        "gmb_verified": True,
        "shipping_days": 5,
        "free_shipping_floor": 80000,
        "warranty_default": "12 meses",
        "category_hint": "electrodomésticos",
    },
    "nico_calzados": {
        "base": "https://www.nicocalzados.com.ar",
        "search": "https://www.nicocalzados.com.ar/search?type=product&q={q}",
        "seller_name": "Nico Calzados",
        "reputation": 0.72,
        "gmb_rating": 4.2,   # tienda local Córdoba, buen rating local
        "gmb_verified": True,
        "shipping_days": 5,
        "free_shipping_floor": 30000,
        "warranty_default": "—",
        "category_hint": "calzado",
    },
}


# ─── FUNCIÓN PÚBLICA ──────────────────────────────────────────────────────────

def search_products(store_key: str, query: str, limit: int = 10) -> list[dict]:
    """
    Uso: search_products("naldo", "heladera no frost", 10)
    """
    cfg = STORES.get(store_key)
    if not cfg:
        raise ValueError(f"Store '{store_key}' no registrado. Opciones: {list(STORES)}")

    url = cfg["search"].format(q=query.replace(" ", "+"))
    try:
        r = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        products = (
            _parse_jsonld(soup, cfg) or
            _parse_next_data(soup, cfg) or
            _parse_shopify_json(r.url, cfg) or  # /search.json para Shopify-like
            _parse_html_cards(soup, cfg)
        )
        return products[:limit]
    except Exception as e:
        print(f"[{store_key}] falló: {e}")
        return []


# ─── PARSERS ──────────────────────────────────────────────────────────────────

def _parse_jsonld(soup, cfg: dict) -> list[dict]:
    products = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get("@type") == "Product":
                    p = _norm_jsonld(item, cfg)
                    if p: products.append(p)
        except Exception:
            continue
    return products


def _parse_next_data(soup, cfg: dict) -> list[dict]:
    nd = soup.find("script", id="__NEXT_DATA__")
    if not nd: return []
    try:
        data = json.loads(nd.string)
        props = data.get("props", {}).get("pageProps", {})
        items = (
            props.get("products") or
            props.get("searchResult", {}).get("products") or
            props.get("data", {}).get("products") or
            props.get("items") or []
        )
        return [_norm_generic(i, cfg) for i in items if i]
    except Exception:
        return []


def _parse_shopify_json(current_url, cfg: dict) -> list[dict]:
    """
    Shopify y plataformas compatibles exponen /search.json
    Nico Calzados puede ser Shopify.
    """
    try:
        base = cfg["base"]
        # Extraer query de la URL actual
        q_match = re.search(r"[?&]q=([^&]+)", str(current_url))
        if not q_match: return []
        q = q_match.group(1)

        r = httpx.get(
            f"{base}/search.json",
            params={"q": q, "type": "product", "limit": 20},
            headers={**HEADERS, "Accept": "application/json"},
            timeout=10,
        )
        if r.status_code != 200: return []
        data = r.json()
        items = data.get("results") or data.get("products") or []
        return [_norm_shopify(i, cfg) for i in items if i]
    except Exception:
        return []


def _parse_html_cards(soup, cfg: dict) -> list[dict]:
    """Fallback: cards HTML genéricas."""
    selectors = [
        ".product-card", "[data-testid='product-card']",
        "article.product", ".item-card", ".product-item",
        ".product-list-item", "li.product",
    ]
    cards = []
    for sel in selectors:
        cards = soup.select(sel)
        if cards: break

    products = []
    for card in cards:
        title_el = card.select_one("h2, h3, .product-name, .product-title, .item-name")
        price_el = card.select_one(".price, .product-price, [data-price], .precio")
        link_el = card.select_one("a[href]")
        img_el = card.select_one("img")

        title = title_el.get_text(strip=True) if title_el else ""
        price = _xprice(price_el.get_text(strip=True) if price_el else "")
        if not title or not price: continue

        products.append(_make_offer(cfg, {
            "title": title,
            "price": price,
            "image_url": img_el.get("src") or img_el.get("data-src") or "" if img_el else "",
            "url": _burl(link_el["href"], cfg["base"]) if link_el else "",
            "brand": "",
            "category": cfg.get("category_hint", ""),
            "stock_available": True,
            "sku": "",
        }))
    return products


# ─── NORMALIZADORES ───────────────────────────────────────────────────────────

def _norm_jsonld(item: dict, cfg: dict) -> Optional[dict]:
    offers = item.get("offers") or {}
    if isinstance(offers, list): offers = offers[0] if offers else {}
    price = _xprice(offers.get("price") or offers.get("lowPrice"))
    if not price: return None
    return _make_offer(cfg, {
        "title": item.get("name") or "",
        "brand": (item.get("brand") or {}).get("name") or item.get("brand") or "",
        "category": item.get("category") or cfg.get("category_hint", ""),
        "image_url": item.get("image") or "",
        "url": offers.get("url") or item.get("url") or "",
        "price": price,
        "stock_available": "InStock" in (offers.get("availability") or ""),
        "sku": item.get("sku") or "",
        "warranty": _find_warranty(item) or cfg["warranty_default"],
    })


def _norm_generic(item: dict, cfg: dict) -> dict:
    price = _xprice(item.get("price") or item.get("salePrice") or item.get("priceWithTax"))
    return _make_offer(cfg, {
        "title": item.get("name") or item.get("title") or "",
        "brand": item.get("brand") or item.get("brandName") or "",
        "category": item.get("category") or cfg.get("category_hint", ""),
        "image_url": item.get("image") or item.get("thumbnail") or "",
        "url": _burl(item.get("url") or item.get("slug") or "", cfg["base"]),
        "price": price,
        "stock_available": item.get("available", True),
        "sku": str(item.get("sku") or item.get("id") or ""),
    })


def _norm_shopify(item: dict, cfg: dict) -> dict:
    """Formato Shopify: /search.json"""
    variant = (item.get("variants") or [{}])[0]
    price = _xprice(variant.get("price") or item.get("price"))
    img = ""
    imgs = item.get("images") or item.get("featured_image") or []
    if isinstance(imgs, list) and imgs:
        img = imgs[0].get("src") or imgs[0] if isinstance(imgs[0], str) else ""
    elif isinstance(imgs, str):
        img = imgs
    return _make_offer(cfg, {
        "title": item.get("title") or "",
        "brand": item.get("vendor") or "",
        "category": item.get("product_type") or cfg.get("category_hint", ""),
        "image_url": img,
        "url": _burl(f"/products/{item.get('handle', '')}", cfg["base"]),
        "price": price,
        "stock_available": variant.get("available", True),
        "sku": str(variant.get("sku") or item.get("id") or ""),
    })


def _make_offer(cfg: dict, data: dict) -> dict:
    """Construye offer completo usando config de la tienda."""
    price = data.get("price")
    return {
        "source": list(STORES.keys())[list(STORES.values()).index(cfg)],
        "seller_name": cfg["seller_name"],
        "title": data.get("title") or "",
        "brand": data.get("brand") or "",
        "category": data.get("category") or cfg.get("category_hint", ""),
        "image_url": data.get("image_url") or "",
        "url": data.get("url") or "",
        "price": price,
        "currency": "ARS",
        "shipping_cost": 0 if price and price >= cfg["free_shipping_floor"] else None,
        "shipping_days": cfg["shipping_days"],
        "warranty": data.get("warranty") or cfg["warranty_default"],
        "seller_reputation": cfg["reputation"],
        "gmb_rating": cfg["gmb_rating"],
        "gmb_verified": cfg["gmb_verified"],
        "stock_available": data.get("stock_available", True),
        "sku": data.get("sku") or "",
    }


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _xprice(v) -> Optional[float]:
    if v is None: return None
    if isinstance(v, (int, float)): return float(v)
    c = re.sub(r"[^\d,.]", "", str(v)).replace(".", "").replace(",", ".")
    try: return float(c)
    except: return None


def _burl(path: str, base: str) -> str:
    if not path: return ""
    return path if path.startswith("http") else f"{base}/{path.lstrip('/')}"


def _find_warranty(item: dict) -> str:
    for prop in item.get("additionalProperty") or []:
        if "garantia" in (prop.get("name") or "").lower():
            return prop.get("value") or ""
    return ""


# ─── SHORTCUTS ────────────────────────────────────────────────────────────────
def naldo(query: str, limit: int = 10): return search_products("naldo", query, limit)
def cetrogar(query: str, limit: int = 10): return search_products("cetrogar", query, limit)
def nico_calzados(query: str, limit: int = 10): return search_products("nico_calzados", query, limit)


if __name__ == "__main__":
    import sys
    store = sys.argv[1] if len(sys.argv) > 2 else "naldo"
    q = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else sys.argv[1] if len(sys.argv) > 1 else "heladera"
    print(f"[{store}] Buscando: {q}")
    print(json.dumps(search_products(store, q, 3), indent=2, ensure_ascii=False))
