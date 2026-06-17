import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const PRODUCT_SELECT = `id, title, brand, category, image_url,
  offers(id, source, seller_name, price, currency,
    shipping_cost, shipping_days, warranty,
    seller_reputation, gmb_rating, gmb_verified,
    stock_available, url, score, installments,
    installments_rate, is_official_store)`

export async function searchProducts(query) {
  if (!query?.trim()) return []

  // Busca por cada palabra significativa con OR
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  let q = supabase.from('products').select(PRODUCT_SELECT)

  if (words.length > 0) {
    // ilike por cada palabra: title ilike %word1% OR title ilike %word2%
    const orFilter = words.map(w => `title.ilike.%${w}%`).join(',')
    q = q.or(orFilter)
  } else {
    q = q.ilike('title', `%${query}%`)
  }

  const { data, error } = await q.limit(40)
  if (error) { console.error('searchProducts error:', error); throw error }
  return normalizeProducts(data || [])
}

export async function getTopProducts(limit = 24) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .limit(limit)
  if (error) { console.error('getTopProducts error:', error); throw error }
  return normalizeProducts(data || [])
}

export async function getRecentOffers(limit = 8) {
  const { data, error } = await supabase
    .from('offers')
    .select(`id, source, seller_name, price, url, updated_at,
      products(id, title, category, image_url)`)
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

function normalizeProducts(products) {
  return products
    .filter(p => p.offers?.length > 0)
    .map(p => {
      const sorted = [...(p.offers || [])].sort((a, b) => (b.score || 0) - (a.score || 0))
      return { ...p, offers: sorted, best_offer: sorted[0] }
    })
}
