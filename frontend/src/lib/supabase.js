import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function searchProducts(query) {
  if (!query?.trim()) return []
  const { data, error } = await supabase
    .from('products')
    .select(`id, title, brand, category, image_url,
      offers(id, source, seller_name, price, currency,
        shipping_cost, shipping_days, warranty,
        seller_reputation, gmb_rating, gmb_verified,
        stock_available, url, score, installments,
        installments_rate, is_official_store)`)
    .ilike('title', `%${query}%`)
    .limit(24)
  if (error) throw error
  return normalizeProducts(data || [])
}

export async function getTopProducts(limit = 20) {
  const { data, error } = await supabase
    .from('products')
    .select(`id, title, brand, category, image_url,
      offers(id, source, seller_name, price, shipping_cost,
        shipping_days, warranty, seller_reputation,
        gmb_rating, gmb_verified, stock_available,
        url, score, installments, installments_rate, is_official_store)`)
    .limit(limit)
  if (error) throw error
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
  if (error) throw error
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
    .map(p => ({
      ...p,
      offers: [...(p.offers || [])].sort((a, b) => (b.score || 0) - (a.score || 0)),
      best_offer: [...(p.offers || [])].sort((a, b) => (b.score || 0) - (a.score || 0))[0],
    }))
}
