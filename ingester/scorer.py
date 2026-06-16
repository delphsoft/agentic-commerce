"""
scorer.py — scoring MVP + variables v2
Score = suma ponderada de variables normalizadas (0 a 1)

MVP (activo):
  precio           28%
  reputacion       22%
  velocidad envio  18%
  gmb_verified     13%
  garantia          9%

V2 (activo cuando hay dato):
  cuotas_sin_interes  5%   ← muy relevante Argentina
  precio_historico    3%   ← subió/bajó esta semana
  vendor_oficial      2%   ← marca oficial vs revendedor

Total = 100%
"""

from typing import Optional

WEIGHTS = {
    # MVP
    "precio": 0.28,
    "reputacion": 0.22,
    "envio": 0.18,
    "gmb": 0.13,
    "garantia": 0.09,
    # V2
    "cuotas": 0.05,
    "precio_historico": 0.03,
    "vendor_oficial": 0.02,
}


def score_offers(offers: list[dict]) -> list[dict]:
    if not offers:
        return []
    prices = [o["price"] for o in offers if o.get("price")]
    min_price = min(prices) if prices else 1
    max_price = max(prices) if prices else 1

    for offer in offers:
        offer["score"] = _calculate(offer, min_price, max_price)

    return sorted(offers, key=lambda o: o["score"], reverse=True)


def _calculate(offer: dict, min_price: float, max_price: float) -> float:
    breakdown = {
        "precio":           _precio(offer.get("price"), min_price, max_price),
        "reputacion":       _reputacion(offer.get("seller_reputation"), offer.get("gmb_rating")),
        "envio":            _envio(offer.get("shipping_cost"), offer.get("shipping_days")),
        "gmb":              _gmb(offer.get("gmb_verified"), offer.get("gmb_rating")),
        "garantia":         _garantia(offer.get("warranty")),
        # V2
        "cuotas":           _cuotas(offer.get("installments"), offer.get("installments_rate")),
        "precio_historico": _precio_historico(offer.get("price_change_pct")),
        "vendor_oficial":   _vendor_oficial(offer.get("is_official_store"), offer.get("source")),
    }

    total = sum(WEIGHTS[k] * v for k, v in breakdown.items())
    offer["score_breakdown"] = {k: round(v, 3) for k, v in breakdown.items()}
    return round(total, 4)


# ─── VARIABLES MVP ─────────────────────────────────────────────────────────────

def _precio(price: Optional[float], min_p: float, max_p: float) -> float:
    if not price: return 0.0
    if max_p == min_p: return 1.0
    return 1 - (price - min_p) / (max_p - min_p)


def _reputacion(seller_rep: Optional[float], gmb_rating: Optional[float]) -> float:
    scores = []
    if seller_rep is not None:
        scores.append(float(seller_rep))
    if gmb_rating is not None:
        scores.append(float(gmb_rating) / 5.0)
    return sum(scores) / len(scores) if scores else 0.5


def _envio(shipping_cost: Optional[float], shipping_days: Optional[int]) -> float:
    cost_score = 0.3
    if shipping_cost is None:
        cost_score = 0.3
    elif shipping_cost == 0:
        cost_score = 0.6
    else:
        cost_score = max(0, 0.6 - (shipping_cost / 5000) * 0.6)

    days_score = 0.3
    if shipping_days is None:
        days_score = 0.3
    elif shipping_days == 0:
        days_score = 1.0
    elif shipping_days == 1:
        days_score = 0.9
    elif shipping_days <= 2:
        days_score = 0.7
    elif shipping_days <= 4:
        days_score = 0.5
    else:
        days_score = 0.2

    return (cost_score + days_score) / 2


def _gmb(verified: Optional[bool], rating: Optional[float]) -> float:
    base = 0.7 if verified else 0.0
    if rating:
        base += (float(rating) / 5.0) * 0.3
    return min(base, 1.0)


def _garantia(warranty: Optional[str]) -> float:
    if not warranty: return 0.2
    w = warranty.lower()
    if "oficial" in w or "fabricante" in w: return 1.0
    if "24" in w or "2 año" in w: return 0.9
    if "12" in w or "1 año" in w: return 0.7
    if "6" in w: return 0.5
    if w == "—" or "sin" in w: return 0.1
    return 0.3


# ─── VARIABLES V2 ──────────────────────────────────────────────────────────────

def _cuotas(installments: Optional[int], rate: Optional[float]) -> float:
    """
    Cuotas sin interés = diferencial clave en Argentina.
    installments: cantidad de cuotas
    rate: 0 = sin interés, >0 = con interés (TNA)
    """
    if installments is None:
        return 0.5  # sin dato = neutral
    if rate == 0 or rate is None:
        # Sin interés: más cuotas = mejor
        if installments >= 12: return 1.0
        if installments >= 6: return 0.85
        if installments >= 3: return 0.65
        return 0.5
    else:
        # Con interés: penalizar
        return max(0, 0.4 - (rate / 100) * 0.4)


def _precio_historico(price_change_pct: Optional[float]) -> float:
    """
    price_change_pct: % de cambio respecto al precio de hace 7 días.
    Negativo = bajó (bueno). Positivo = subió (malo).
    None = sin dato = neutral.
    """
    if price_change_pct is None:
        return 0.5  # neutral
    if price_change_pct <= -10:
        return 1.0  # bajó más del 10% — oferta real
    if price_change_pct <= -5:
        return 0.8
    if price_change_pct <= 0:
        return 0.6  # estable o bajó poco
    if price_change_pct <= 5:
        return 0.4  # subió poco
    if price_change_pct <= 15:
        return 0.2  # subió bastante
    return 0.0  # subió mucho — evitar


def _vendor_oficial(is_official: Optional[bool], source: Optional[str]) -> float:
    """
    Vendedor oficial de la marca = más confianza.
    Frávega/Garbarino/Musimundo/Naldo/Cetrogar son tiendas "oficiales" por naturaleza.
    En MELI hay que verificar el flag is_official_store.
    """
    # Retailers físicos siempre son "oficiales" como canal
    official_retailers = {"fravega", "garbarino", "musimundo", "naldo", "cetrogar"}
    if source in official_retailers:
        return 1.0
    if is_official:
        return 1.0
    if is_official is False:
        return 0.3
    return 0.5  # sin dato


# ─── TEST ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    offers = [
        {
            "source": "meli", "seller_name": "TechStore", "price": 280000,
            "seller_reputation": 0.95, "gmb_rating": None, "gmb_verified": False,
            "shipping_cost": 0, "shipping_days": 2, "warranty": "12 meses",
            "is_official_store": False,
            "installments": 12, "installments_rate": 0,   # V2: 12 cuotas sin interés
            "price_change_pct": -8,                        # V2: bajó 8%
        },
        {
            "source": "fravega", "seller_name": "Frávega", "price": 298000,
            "seller_reputation": 0.85, "gmb_rating": 3.8, "gmb_verified": True,
            "shipping_cost": 0, "shipping_days": 3, "warranty": "12 meses oficial",
            "is_official_store": None,
            "installments": 18, "installments_rate": 0,   # V2: 18 cuotas sin interés
            "price_change_pct": 2,                         # V2: subió 2%
        },
        {
            "source": "garbarino", "seller_name": "Garbarino", "price": 275000,
            "seller_reputation": 0.80, "gmb_rating": 3.5, "gmb_verified": True,
            "shipping_cost": None, "shipping_days": 4, "warranty": "12 meses",
            "is_official_store": None,
            "installments": 6, "installments_rate": 0,    # V2: 6 cuotas sin interés
            "price_change_pct": None,                      # V2: sin dato histórico
        },
    ]
    ranked = score_offers(offers)
    print("\n── Ranking ──────────────────────────────────")
    for o in ranked:
        print(f"\n{o['seller_name']:15} score={o['score']} precio=ARS${o['price']:,.0f}")
        bd = o['score_breakdown']
        for k, v in bd.items():
            bar = "█" * int(v * 20)
            print(f"  {k:20} {v:.2f}  {bar}")
