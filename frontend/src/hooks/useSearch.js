import { useState, useCallback, useEffect } from 'react'
import { searchProducts, getTopProducts } from '../lib/supabase'
import { MOCK_PRODUCTS } from '../data/mock'

export function useSearch() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [agentMsg, setAgentMsg] = useState(
    'Cargando los productos más buscados...'
  )

  // Carga inicial: trae productos reales de Supabase al abrir la página
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const top = await getTopProducts(24)
        if (cancelled) return
        if (top.length > 0) {
          setProducts(top)
          setAgentMsg(`Mostrando ${top.length} productos. Buscá lo que necesités o filtrá por categoría.`)
        } else {
          setProducts(MOCK_PRODUCTS)
          setAgentMsg('Mostrando productos de ejemplo. Buscá lo que necesités.')
        }
      } catch (e) {
        if (cancelled) return
        console.error('Error cargando productos:', e)
        setProducts(MOCK_PRODUCTS)
        setAgentMsg('Mostrando productos de ejemplo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const search = useCallback(async (q) => {
    if (!q?.trim()) return
    setLoading(true)
    setQuery(q)
    setAgentMsg(`Buscando "${q}"...`)

    try {
      const results = await searchProducts(q)
      if (results.length > 0) {
        setProducts(results)
        setAgentMsg(`Encontré ${results.length} productos para "${q}".`)
      } else {
        // Si no hay match en DB, intenta traer top products de nuevo
        const top = await getTopProducts(24)
        setProducts(top.length > 0 ? top : MOCK_PRODUCTS)
        setAgentMsg(`Sin resultados exactos para "${q}". Mostrando populares.`)
      }
    } catch (e) {
      console.error('Error en búsqueda:', e)
      setAgentMsg(`Error al buscar "${q}". Reintentá.`)
    } finally {
      setLoading(false)
    }
  }, [])

  return { products, loading, query, agentMsg, setAgentMsg, search }
}
