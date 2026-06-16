import { CAT_EMOJI } from '../data/mock'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-AR') }

export default function CartDrawer({ cart, isOpen, onClose, onRemove }) {
  const total = cart.reduce((a, p) => a + (p.selectedOffer?.price || 0), 0)
  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200 }} />}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 320,
        background: '#fff', borderLeft: '1px solid var(--border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .25s ease',
        boxShadow: '-8px 0 32px rgba(0,0,0,.08)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Carrito ({cart.length})</h3>
          <button onClick={onClose} style={{ background: '#f0f0f3', border: 'none', borderRadius: 8, padding: '4px 10px', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cart.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Tu carrito está vacío</p>
            : cart.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: '#f0f0f3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {p.emoji || CAT_EMOJI[p.category] || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--acc)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{fmt(p.selectedOffer?.price)}</div>
                </div>
                <button onClick={() => onRemove(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>✕</button>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{fmt(total)}</strong>
            </div>
            <button style={{ width: '100%', padding: 13, background: 'var(--acc)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 12, cursor: 'pointer' }}>
              💳 Pagar con Mercado Pago
            </button>
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>Checkout seguro vía Mercado Pago</p>
          </div>
        )}
      </div>
    </>
  )
}
