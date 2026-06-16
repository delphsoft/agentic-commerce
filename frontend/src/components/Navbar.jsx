export default function Navbar({ cartCount, onOpenCart }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--acc)',
          display: 'inline-block', animation: 'pulse 2s infinite',
        }} />
        AgentShop
      </div>
      <button onClick={onOpenCart} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surf)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '6px 14px', fontSize: 12,
        cursor: 'pointer', color: 'var(--text)',
      }}>
        <i className="ti ti-shopping-cart" aria-hidden="true" />
        Carrito
        <span style={{
          background: cartCount > 0 ? 'var(--acc)' : 'var(--border)',
          color: cartCount > 0 ? '#000' : 'var(--muted)',
          fontSize: 10, fontWeight: 700, borderRadius: '50%',
          width: 18, height: 18, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
        }}>{cartCount}</span>
      </button>
    </nav>
  )
}
