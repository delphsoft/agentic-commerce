import sys
import os
from datetime import datetime, timezone
from supabase import create_client, Client

from scrapers.serpapi_shopping import search_products as serpapi_search
from scrapers.meli_oauth import search_products as meli_search
from scrapers.gmb import enrich_offer_with_gmb
from scorer import score_offers

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
HAS_SERPAPI = bool(os.environ.get("SERPAPI_KEY"))
HAS_MELI = bool(os.environ.get("MELI_ACCESS_TOKEN"))

DEFAULT_QUERIES = {
    "electronica":  ["auriculares inalambricos", "smart tv 55 pulgadas", "notebook i5", "parlante bluetooth"],
    "celulares":    ["celular samsung galaxy", "iphone 15", "motorola edge", "xiaomi redmi"],
    "hogar":        ["heladera no frost", "aire acondicionado split 3000", "lavarropas automatico"],
    "moda":         ["zapatillas running hombre", "zapatillas urbanas mujer"],
    "computacion":  ["monitor 24 pulgadas", "teclado mecanico", "mouse gamer"],
}


def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def upsert_product(sb, offer):
    title = offer.get("title", "").strip()
    if not title:
        return None
    existing = sb.table("products").select("id, image_url").eq("title", title).limit(1).execute()
    if existing.data:
        pid = existing.data[0]["id"]
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


def upsert_offer(sb, product_id, offer):
    sb.table("offers").upsert({
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
    }, on_conflict="product_id,source").execute()


def ingest_query(sb, query, vertical="default"):
    print(f"\n[ingest] '{query}' | vertical={vertical}")
    all_offers = []

    if HAS_SERPAPI:
        results = serpapi_search(query, limit=10)
        # Asignar categoria segun el vertical buscado
        for o in results:
            if not o.get("category"):
                o["category"] = vertical
        results = [enrich_offer_with_gmb(o) for o in results]
        all_offers.extend(results)

    if HAS_MELI:
        meli_results = meli_search(query, limit=8)
        for o in meli_results:
            if not o.get("category") or o.get("category", "").startswith("ML"):
                o["category"] = vertical
        meli_results = [enrich_offer_with_gmb(o) for o in meli_results]
        all_offers.extend(meli_results)

    if not all_offers:
        print("  Sin resultados — verificá SERPAPI_KEY")
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

    print(f"  OK {inserted} pusheadas")
    return inserted


def main():
    print(f"[ingest] SerpAPI={'ON' if HAS_SERPAPI else 'OFF'} | MELI={'ON' if HAS_MELI else 'OFF'}")
    sb = get_supabase()
    args = sys.argv[1:]

    if not args or args[0] == "--all":
        total = 0
        count = sum(len(v) for v in DEFAULT_QUERIES.values())
        print(f"[ingest] Corriendo {count} queries...")
        for vertical, queries in DEFAULT_QUERIES.items():
            for q in queries:
                total += ingest_query(sb, q, vertical)
        print(f"\n[ingest] Total: {total} offers en Supabase")
    else:
        ingest_query(sb, " ".join(args))


if __name__ == "__main__":
    main()
