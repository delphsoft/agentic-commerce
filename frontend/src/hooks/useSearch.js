import { useState, useCallback } from 'react'
import { searchProducts, getTopProducts } from '../lib/supabase'
import { MOCK_PRODUCTS } from '../data/mock'

export function useSearch() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [agentMsg, setAgentMsg] = useState(
    'Mostrando los más buscados hoy. Seleccioná tu banco para ver el precio real con descuento.'
  )

  const search = useCallback(async (q) => {
    if (!q?.trim()) return
    setLoading(true)
    setQuery(q)
    setAgentMsg(`Buscando "${q}" en Frávega, Garbarino, Naldo, MELI y más...`)

    try {
      const results = await searchProducts(q)
      if (results.length > 0) {
        setProducts(results)
        setAgentMsg(`Encontré ${results.length} productos para "${q}".`)
      } else {
        const filtered = MOCK_PRODUCTS.filter(p =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.brand?.toLowerCase().includes(q.toLowerCase()) ||
          p.category?.toLowerCase().includes(q.toLowerCase()) ||
          q.split(' ').some(w => w.length > 2 && p.title.toLowerCase().includes(w))
        )
        setProducts(filtered.length > 0 ? filtered : MOCK_PRODUCTS)
        setAgentMsg(filtered.length > 0
          ? `Encontré ${filtered.length} productos para "${q}".`
          : `Sin resultados exactos para "${q}". Mostrando populares.`)
      }
    } catch {
      const filtered = MOCK_PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        q.split(' ').some(w => w.length > 2 && p.title.toLowerCase().includes(w))
      )
      setProducts(filtered.length > 0 ? filtered : MOCK_PRODUCTS)
      setAgentMsg(`Mostrando resultados locales para "${q}".`)
    }

    setLoading(false)
  }, [])

  return { products, loading, query, agentMsg, setAgentMsg, search }
}
