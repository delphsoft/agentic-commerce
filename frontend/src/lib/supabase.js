import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function getTopProducts(limit = 24) {
  // Query 1: productos
  const { data: products, error: pe } = await supabase
    .from('products')
    .select('id, title, brand, category, image_url')
    .limit(limit)
  if (pe) throw pe
  if (!products?.length) return []

  // Query 2: offers para esos productos
  const ids = products.map(p => p.id)
  const { data: offers, error: oe } = await supabase
    .from('offers')
    .select('id, product_id, source, seller_name, price, currency, shipping_cost, shipping_days, warranty, seller_reputation, gmb_rating, gmb_verified, stock_available, url, score, installments, installments_rate, is_official_store')
    .in('product_id', ids)
  if (oe) throw oe

  return attachOffers(products, offers || [])
}

export async function searchProducts(query) {
  if (!query?.trim()) return []
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)

  let q = supabase.from('products').select('id, title, brand, category, image_url')
  if (words.length > 0) {
    q = q.or(words.map(w => `title.ilike.%${w}%`).join(','))
  } else {
    q = q.ilike('title', `%${query}%`)
  }
  const { data: products, error: pe } = await q.limit(40)
  if (pe) throw pe
  if (!products?.length) return []

  const ids = products.map(p => p.id)
  const { data: offers, error: oe } = await supabase
    .from('offers')
    .select('id, product_id, source, seller_name, price, currency, shipping_cost, shipping_days, warranty, seller_reputation, gmb_rating, gmb_verified, stock_available, url, score, installments, installments_rate, is_official_store')
    .in('product_id', ids)
  if (oe) throw oe

  return attachOffers(products, offers || [])
}

function attachOffers(products, offers) {
  const byProduct = {}
  for (const o of offers) {
    if (!byProduct[o.product_id]) byProduct[o.product_id] = []
    byProduct[o.product_id].push(o)
  }
  return products
    .map(p => {
      const sorted = (byProduct[p.id] || []).sort((a, b) => (b.score || 0) - (a.score || 0))
      return { ...p, offers: sorted, best_offer: sorted[0] }
    })
    .filter(p => p.offers.length > 0)
}

export async function getRecentOffers(limit = 8) {
  const { data, error } = await supabase
    .from('offers')
    .select('id, source, seller_name, price, url, updated_at, product_id')
    .eq('stock_available', true)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data || []
}

export async function getBancoPromos() {
  const { data, error } = await supabase
    .from('banco_promos')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: true })
  if (error) return []
  return data || []
}
