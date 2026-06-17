"""
ingest.py — orquesta todos los scrapers y pushea a Supabase
Uso:
  python ingester/ingest.py "auriculares"
  python ingester/ingest.py --all
  python ingester/ingest.py --source meli "notebook"
"""
import sys, os
from datetime import datetime, timezone
from supabase import create_client, Client

from scrapers.fravega import search_products as fravega_search
from scrapers.garbarino import search_products as garbarino_search
from scrapers.mercadolibre import search_products as meli_search
from scrapers.musimundo import search_products as musimundo_search
from scrapers.ar_retailers import naldo, cetrogar, nico_calzados
from scrapers.tiendanube import search_all_stores as tiendanube_search
from scrapers.gmb import enrich_offer_with_gmb
from scorer import score_offers

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

DEFAULT_QUERIES = {
    "electronica":  ["auriculares inalambricos", "smart tv 55", "notebook lenovo", "camara seguridad wifi", "parlante bluetooth"],
    "celulares":    ["celular samsung", "iphone", "motorola 5g", "celular xiaomi"],
    "hogar":        ["heladera no frost", "aire acondicionado split", "lavarropas automatico", "microondas"],
    "moda":         ["zapatillas running", "zapatillas urbanas", "botinetas mujer"],
    "computacion":  ["monitor 24 pulgadas", "teclado mecanico", "mouse gamer", "disco ssd"],
}

SOURCES = {
    "fravega":       lambda q, n: fravega_search(q, n),
    "garbarino":     lambda q, n: garbarino_search(q, n),
    "meli":          lambda q, n: meli_search(q, n),
    "musimundo":     lambda q, n: musimundo_search(q, n),
    "naldo":         lambda q, n: naldo(q, n),
    "cetrogar":      lambda q, n: cetrogar(q, n),
    "nico_calzados": lambda q, n: nico_calzados(q, n),
    "tiendanube":    lambda q, n: tiendanube_search(q, n // 2 + 1),
}

VERTICAL_SOURCES = {
    "electronica":  ["meli", "fravega", "garbarino", "musimundo", "naldo", "cetrogar"],
    "celulares":    ["meli", "fravega", "garbarino", "musimundo"],
    "hogar":        ["meli", "fravega", "garbarino", "naldo", "cetrogar"],
    "moda":         ["meli", "nico_calzados"],
    "computacion":  ["meli", "fravega", "garbarino"],
    "default":      ["meli", "fravega", "garbarino"],
}


def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def upsert_product(sb: Client, offer: dict) -> str:
    title = offer.get("title", "").strip()
    if not title:
        return None

    existing = sb.table("products").select("id, image_url").eq("title", title).limit(1).execute()
    if existing.data:
        pid = existing.data[0]["id"]
        # Update image_url if we have one and the existing one is empty
        if offer.get("image_url") and not existing.data[0].get("image_url"):
            sb.table("products").update({"image_url": offer["image_url"]}).eq("id", pid).execute()
        return pid

    result = sb.table("products").insert({
        "title": title,
        "brand": offer.get("brand", ""),
        "category": offer.get("category", ""),
        "image_url": offer.get("image_url", ""),
    }).execute()
    return result.data[0]["id"]


def upsert_offer(sb: Client, product_id: str, offer: dict):
    payload = {
        "product_id": product_id,
        "source": offer.get("source"),
        "seller_name": offer.get("seller_name"),
        "price": offer.get("price"),
        "currency": offer.get("currency", "ARS"),
        "shipping_cost": offer.get("shipping_cost"),
        "shipping_days": offer.get("shipping_days"),
        "warranty": offer.get("warranty"),
        "seller_reputation": offer.get("seller_reputation"),
        "gmb_rating": offer.get("gmb_rating"),
        "gmb_verified": offer.get("gmb_verified", False),
        "stock_available": offer.get("stock_available", True),
        "url": offer.get("url", ""),
        "score": offer.get("score", 0),
        "installments": offer.get("installments"),
        "installments_rate": offer.get("installments_rate"),
        "is_official_store": offer.get("is_official_store"),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    sb.table("offers").upsert(payload, on_conflict="product_id,source").execute()


def ingest_query(sb: Client, query: str, vertical: str = "default", only_source: str = None):
    print(f"\n[ingest] '{query}' | vertical={vertical}")

    sources = [only_source] if only_source else VERTICAL_SOURCES.get(vertical, VERTICAL_SOURCES["default"])
    all_offers = []

    for source_key in sources:
        fn = SOURCES.get(source_key)
        if not fn:
            continue
        try:
            results = fn(query, 8)
            # Enrich with real GMB data (SerpAPI or fallback)
            results = [enrich_offer_with_gmb(o) for o in results]
            print(f"  {source_key:15} → {len(results)} productos")
            all_offers.extend(results)
        except Exception as e:
            print(f"  {source_key:15} → ERROR: {e}")

    if not all_offers:
        print("  Sin resultados")
        return 0

    scored = score_offers([o for o in all_offers if o.get("price")])
    print(f"  Scored: {len(scored)} offers")

    inserted = 0
    for offer in scored:
        try:
            pid = upsert_product(sb, offer)
            if pid:
                upsert_offer(sb, pid, offer)
                inserted += 1
        except Exception as e:
            print(f"  [db error] {offer.get('title', '?')[:50]}: {e}")

    try:
        sb.table("searches").insert({"query": query, "results_count": inserted}).execute()
    except Exception:
        pass

    print(f"  ✓ {inserted}/{len(scored)} pusheadas")
    return inserted


def main():
    sb = get_supabase()
    args = sys.argv[1:]

    only_source = None
    if "--source" in args:
        idx = args.index("--source")
        only_source = args[idx + 1]
        args = [a for i, a in enumerate(args) if i not in (idx, idx + 1)]

    if not args or args[0] == "--all":
        total = 0
        print(f"[ingest] Corriendo {sum(len(v) for v in DEFAULT_QUERIES.values())} queries...")
        for vertical, queries in DEFAULT_QUERIES.items():
            for q in queries:
                total += ingest_query(sb, q, vertical, only_source)
        print(f"\n[ingest] ✓ Total: {total} offers en Supabase")
    else:
        query = " ".join(args)
        ingest_query(sb, query, "default", only_source)


if __name__ == "__main__":
    main()
