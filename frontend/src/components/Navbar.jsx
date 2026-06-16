export default function Navbar({ cartCount, onOpenCart, productCount = 1284, storeCount = 8 }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px', background: 'var(--bg)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
        display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text)',
      }}>
        AgentShop
        <span style={{ color: 'var(--acc)', fontSize: 22, lineHeight: 1 }}>.</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>
          {storeCount} tiendas · {productCount.toLocaleString('es-AR')} productos
        </span>
        <button onClick={onOpenCart} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', position: 'relative', padding: 4,
          display: 'flex', alignItems: 'center',
        }}>
          <i className="ti ti-shopping-cart" style={{ fontSize: 22 }} aria-hidden="true" />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: 'var(--acc)', color: '#fff',
              fontSize: 9, fontWeight: 700, borderRadius: '50%',
              width: 16, height: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>{cartCount}</span>
          )}
        </button>
      </div>
    </nav>
  )
}
