import { useState } from 'react'
import { SRC } from '../data/mock'

function fmt(n) {
  if (!n) return '—'
  return 'ARS $' + Math.round(n).toLocaleString('es-AR')
}

function getEffectivePrice(offer, banco) {
  if (!banco) return null
  const storeMatch = !banco.stores?.length || banco.stores.includes(offer.source)
  if (!storeMatch) return null
  if (banco.tipo === 'descuento') return Math.round(offer.price * (1 - banco.pct / 100))
  return null
}

function ScoreBar({ label, value }) {
  const pct = Math.round((value || 0) * 100)
  const color = pct >= 70 ? '#4f46e5' : pct >= 40 ? '#F0A500' : '#E8002D'
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
        <div style={{ height: 4, width: `${pct}%`, borderRadius: 2, background: color }} />
      </div>
    </div>
  )
}

function OfferRow({ offer, isTop, banco, onBuy }) {
  const s = SRC[offer.source] || { label: offer.source, bg: '#444', tc: '#fff' }
  const ep = getEffectivePrice(offer, banco)

  return (
    <div style={{
      background: isTop ? 'rgba(79,70,229,.04)' : 'var(--card)',
      border: `1px solid ${isTop ? 'rgba(79,70,229,.28)' : 'var(--border)'}`,
      borderRadius: 9, padding: '11px 13px', marginBottom: 7,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ background: s.bg, color: s.tc, fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '1px 5px' }}>{s.label}</span>
        {isTop && <span style={{ fontSize: 9, color: 'var(--acc)', background: 'rgba(79,70,229,.1)', border: '1px solid rgba(79,70,229,.2)', borderRadius: 4, padding: '1px 6px' }}>✦ Mejor opción</span>}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>Score: <strong style={{ color: 'var(--text)' }}>{Math.round((offer.score || 0) * 100)}</strong>/100</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: ep ? 14 : 18, fontWeight: 700,
          textDecoration: ep ? 'line-through' : 'none',
          color: ep ? 'var(--muted)' : 'var(--text)',
        }}>{fmt(offer.price)}</div>
        {ep && <>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--acc)' }}>{fmt(ep)}</div>
          <span style={{ fontSize: 10, color: 'var(--acc)' }}>con {banco.banco} (-{banco.pct}%)</span>
        </>}
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 7 }}>
        {offer.shipping_cost === 0 ? '🟢 Envío gratis' : offer.shipping_cost ? `📦 ${fmt(offer.shipping_cost)}` : '📦 Consultar'}
        {offer.shipping_days != null && ` · ${offer.shipping_days === 0 ? 'Mismo día' : offer.shipping_days === 1 ? '24hs' : offer.shipping_days + 'd'}`}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 9, fontSize: 10, color: 'var(--muted)' }}>
        {offer.warranty && offer.warranty !== '—' && <span>🛡 {offer.warranty}</span>}
        {offer.installments && <span>💳 {offer.installments} cuotas{offer.installments_rate === 0 ? ' s/i' : ''}</span>}
        {offer.gmb_verified && offer.gmb_rating && <span style={{ color: '#34A853' }}>📍 {offer.gmb_name || 'Local verificado'} {offer.gmb_rating}★</span>}
        {offer.is_official_store && <span>✓ Oficial</span>}
      </div>

      <button
        onClick={() => onBuy(offer)}
        style={{
          width: '100%', padding: 8,
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
          borderRadius: 8, border: `1px solid ${isTop ? 'var(--acc)' : 'var(--border)'}`,
          background: isTop ? 'var(--acc)' : 'transparent',
          color: isTop ? '#000' : 'var(--text)', cursor: 'pointer',
        }}
      >
        {isTop ? `Comprar en ${s.label} →` : `Ver en ${s.label} →`}
      </button>
    </div>
  )
}

export default function ProductModal({ product, banco, onClose, onAddCart }) {
  const [tab, setTab] = useState('ofertas')
  if (!product) return null

  const offers = product.offers || []
  const best = offers[0]
  const ep = getEffectivePrice(best, banco)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
        zIndex: 300, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '20px 16px',
        overflowY: 'auto', minHeight: '100vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#161A18', border: '1px solid var(--border)',
          borderRadius: 14, width: '100%', maxWidth: 520,
          animation: 'fadein .2s ease',
        }}
      >
        {/* Head */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--acc)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{product.brand}</div>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{product.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
              Desde {fmt(best?.price)}
              {ep && <span style={{ color: 'var(--acc)', fontWeight: 500 }}> · 💳 {fmt(ep)} con {banco.banco}</span>}
              {' · '}{offers.length} vendedor{offers.length > 1 ? 'es' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surf2)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 18px' }}>
          {[['ofertas', `Dónde comprar (${offers.length})`], ['scoring', 'Cómo elegimos']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', padding: '10px 14px 8px',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              color: tab === key ? 'var(--text)' : 'var(--muted)',
              borderBottom: `2px solid ${tab === key ? 'var(--acc)' : 'transparent'}`,
            }}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '14px 18px' }}>
          {tab === 'ofertas' ? (
            <>
              {offers.map((o, i) => (
                <OfferRow key={o.id || i} offer={o} isTop={i === 0} banco={banco} onBuy={o => o.url && o.url !== '#' && window.open(o.url, '_blank')} />
              ))}
              <button
                onClick={() => { onAddCart(product, best); onClose() }}
                style={{ width: '100%', marginTop: 8, padding: 9, background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}
              >
                + Agregar al carrito
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>
                Rankeamos vendedores combinando precio, reputación, envío, local Google verificado y cuotas sin interés.
              </p>
              {[
                ['Precio competitivo', 'precio'],
                ['Reputación del vendedor', 'reputacion'],
                ['Velocidad de envío', 'envio'],
                ['Local verificado (GMB)', 'gmb'],
                ['Garantía oficial', 'garantia'],
                ['Cuotas sin interés', 'cuotas'],
              ].map(([label, key]) => (
                <ScoreBar key={key} label={label} value={best?.breakdown?.[key] || 0} />
              ))}
              <div style={{ marginTop: 14, padding: '9px 12px', background: 'rgba(79,70,229,.06)', border: '1px solid rgba(79,70,229,.15)', borderRadius: 8, fontSize: 11, color: 'var(--muted)' }}>
                Score total: <strong style={{ color: 'var(--acc)', fontSize: 14 }}>{Math.round((best?.score || 0) * 100)}/100</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
