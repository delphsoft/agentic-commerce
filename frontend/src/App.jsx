import { useState } from 'react'
import { MOCK_PRODUCTS } from './data/mock'
import { useSearch } from './hooks/useSearch'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import BancoPromos from './components/BancoPromos'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import {
  MasBuscados, OfertasRecientes, TopCategoria,
  GuiaBusqueda, Filters, AgentBar, ProductGrid,
} from './components/Sections'

export default function App() {
  const { products, loading, agentMsg, setAgentMsg, search } = useSearch()
  const [activeCat, setActiveCat] = useState('todos')
  const [selectedBanco, setSelectedBanco] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  function openProduct(id) {
    const p = products.find(x => x.id === id) || MOCK_PRODUCTS.find(x => x.id === id)
    setSelectedProduct(p || null)
  }

  function addToCart(product, offer) {
    setCart(prev => prev.find(p => p.id === product.id) ? prev : [...prev, { ...product, selectedOffer: offer }])
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id))
  }

  function handleSelectBanco(banco) {
    setSelectedBanco(banco)
    if (banco) {
      setAgentMsg(`💳 ${banco.banco} activo — ${banco.promo} en ${banco.tags.join(', ')||'todas las categorías'}. Precios actualizados con tu descuento.`)
    } else {
      setAgentMsg('Seleccioná tu banco para ver el precio real con descuento.')
    }
  }

  return (
    <>
      <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />

      <SearchBar onSearch={search} onSetAgent={setAgentMsg} />

      <Filters activeCat={activeCat} onSetCat={setActiveCat} />

      <AgentBar message={agentMsg} />

      {/* BLOQUE 1: Más buscados */}
      <MasBuscados onSelect={openProduct} />

      {/* BLOQUE 2: Puestos en oferta (arriba de promos) */}
      <OfertasRecientes onSelect={openProduct} />

      {/* BLOQUE 3: Promos bancarias */}
      <BancoPromos selectedBanco={selectedBanco} onSelectBanco={handleSelectBanco} />

      {/* BLOQUE 4: Top categoría */}
      <TopCategoria onSelect={openProduct} />

      {/* BLOQUE 5: Grilla principal */}
      {loading
        ? <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px', fontSize: 13 }}>Buscando...</p>
        : <ProductGrid products={products} activeCat={activeCat} selectedBanco={selectedBanco} onSelect={openProduct} />
      }

      {/* BLOQUE 6: Guía de búsqueda (al final) */}
      <GuiaBusqueda onSearch={search} />

      <footer style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>AgentShop · delphsoft · Argentina</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['Vite + React', 'Supabase', 'MELI API', 'GMB', 'Mercado Pago'].map(t => (
            <span key={t} style={{ fontSize: 9, color: 'var(--muted)', background: 'var(--surf)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>{t}</span>
          ))}
        </div>
      </footer>

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          banco={selectedBanco}
          onClose={() => setSelectedProduct(null)}
          onAddCart={addToCart}
        />
      )}

      {/* Cart */}
      <CartDrawer cart={cart} isOpen={cartOpen} onClose={() => setCartOpen(false)} onRemove={removeFromCart} />
    </>
  )
}
