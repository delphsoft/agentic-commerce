import { CAT_EMOJI } from '../data/mock'

function fmt(n) {
  return 'ARS $' + Math.round(n).toLocaleString('es-AR')
}

export default function CartDrawer({ cart, isOpen, onClose, onRemove }) {
  const total = cart.reduce((a, p) => a + (p.selectedOffer?.price || 0), 0)

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200 }} />}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 300,
        background: 'var(--surf)', borderLeft: '1px solid var(--border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .25s ease',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Carrito ({cart.length})</h3>
          <button onClick={onClose} style={{ background: 'var(--surf2)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px' }}>
          {cart.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', paddingTop: 40 }}>Carrito vacío</p>
            : cart.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, padding: '9px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: 20 }}>{p.emoji || CAT_EMOJI[p.category] || '📦'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--acc)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{fmt(p.selectedOffer?.price)}</div>
                </div>
                <button onClick={() => onRemove(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>✕</button>
              </div>
            ))
          }
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{fmt(total)}</strong>
            </div>
            <button style={{ width: '100%', padding: 11, background: 'var(--acc)', color: '#000', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
              💳 Pagar con Mercado Pago
            </button>
            <p style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>Checkout seguro vía Mercado Pago Checkout Pro</p>
          </div>
        )}
      </div>
    </>
  )
}
