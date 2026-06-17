import ProductImage from './ProductImage'
import { useState } from 'react'
import { SRC } from '../data/mock'

function fmt(n) {
  if (!n) return '—'
  return '$' + Math.round(n).toLocaleString('es-AR')
}

function getEffectivePrice(offer, banco) {
  if (!banco) return null
  const storeMatch = !banco.stores?.length || banco.stores.includes(offer.source)
  if (!storeMatch) return null
  if (banco.tipo === 'descuento') return Math.round(offer.price * (1 - banco.pct / 100))
  return null
}

function ImgPlaceholder({ emoji }) {
  return (
    <div style={{
      width: 80, height: 80, background: '#f0f0f3', borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32, flexShrink: 0,
    }}>{emoji || '📦'}</div>
  )
}

function ScoreBar({ label, value }) {
  const pct = Math.round((value || 0) * 100)
  const color = pct >= 70 ? '#4f46e5' : pct >= 40 ? '#F0A500' : '#E8002D'
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
        <span>{label}</span><span style={{ fontWeight: 600, color: 'var(--text)' }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: '#f0f0f3', borderRadius: 3 }}>
        <div style={{ height: 5, width: `${pct}%`, borderRadius: 3, background: color }} />
      </div>
    </div>
  )
}

function OfferRow({ offer, isTop, banco, onBuy }) {
  const s = SRC[offer.source] || { label: offer.source, bg: '#444', tc: '#fff' }
  const ep = getEffectivePrice(offer, banco)

  return (
    <div style={{
      background: isTop ? 'rgba(79,70,229,.04)' : '#fafafa',
      border: `1.5px solid ${isTop ? 'rgba(79,70,229,.3)' : 'var(--border)'}`,
      borderRadius: 12, padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ background: s.bg, color: s.tc, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 7px' }}>{s.label}</span>
        {isTop && (
          <span style={{
            fontSize: 10, color: 'var(--acc)', background: 'rgba(79,70,229,.1)',
            border: '1px solid rgba(79,70,229,.2)', borderRadius: 6, padding: '2px 8px', fontWeight: 600,
          }}>✦ Mejor opción</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
          Score <strong style={{ color: 'var(--text)' }}>{Math.round((offer.score || 0) * 100)}</strong>/100
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: ep ? 15 : 22, fontWeight: 700,
          textDecoration: ep ? 'line-through' : 'none', color: ep ? 'var(--muted)' : 'var(--text)',
        }}>{fmt(offer.price)}</div>
        {ep && <>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--acc)' }}>{fmt(ep)}</div>
          <span style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 500 }}>con {banco.banco} (-{banco.pct}%)</span>
        </>}
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        {offer.shipping_cost === 0 ? '🟢 Envío gratis' : offer.shipping_cost ? `📦 $${offer.shipping_cost.toLocaleString()}` : '📦 Consultar'}
        {offer.shipping_days != null && ` · ${offer.shipping_days === 0 ? 'Mismo día' : offer.shipping_days === 1 ? '24hs' : offer.shipping_days + 'd'}`}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, fontSize: 11, color: 'var(--muted)' }}>
        {offer.warranty && offer.warranty !== '—' && <span>🛡 {offer.warranty}</span>}
        {offer.installments && <span>💳 {offer.installments} cuotas{offer.installments_rate === 0 ? ' s/i' : ''}</span>}
        {offer.gmb_verified && offer.gmb_rating && <span style={{ color: '#34A853' }}>📍 {offer.gmb_name || 'Local verificado'} {offer.gmb_rating}★</span>}
        {offer.is_official_store && <span style={{ color: 'var(--acc)' }}>✓ Tienda oficial</span>}
      </div>

      <button onClick={() => onBuy(offer)} style={{
        width: '100%', padding: '10px',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
        borderRadius: 10,
        background: isTop ? 'var(--acc)' : 'transparent',
        color: isTop ? '#fff' : 'var(--text)',
        border: isTop ? 'none' : '1.5px solid var(--border)',
        cursor: 'pointer',
      }}>
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
  const emoji = product.emoji || '📦'

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      zIndex: 300, display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', padding: '40px 16px', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'fadein .2s ease',
        overflow: 'hidden',
      }}>
        {/* Head */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <ProductImage src={product.image_url} emoji={emoji} size={80} style={{ width: 80, height: 80, marginBottom: 0, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{product.brand}</div>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{product.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Desde {fmt(best?.price)}
              {ep && <span style={{ color: 'var(--acc)', fontWeight: 600 }}> · 💳 {fmt(ep)} con {banco.banco}</span>}
              {' · '}{offers.length} vendedor{offers.length > 1 ? 'es' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#f0f0f3', border: 'none', borderRadius: 8,
            padding: '6px 10px', color: 'var(--muted)', cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {[['ofertas', `Dónde comprar (${offers.length})`], ['scoring', 'Cómo elegimos']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', padding: '12px 16px 10px',
              fontSize: 13, fontWeight: tab === key ? 700 : 400, cursor: 'pointer',
              color: tab === key ? 'var(--text)' : 'var(--muted)',
              borderBottom: `2px solid ${tab === key ? 'var(--acc)' : 'transparent'}`,
              fontFamily: 'var(--font-sans)',
            }}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {tab === 'ofertas' ? (
            <>
              {offers.map((o, i) => (
                <OfferRow key={o.id || i} offer={o} isTop={i === 0} banco={banco}
                  onBuy={o => o.url && o.url !== '#' && window.open(o.url, '_blank')} />
              ))}
              <button onClick={() => { onAddCart(product, best); onClose() }} style={{
                width: '100%', marginTop: 4, padding: '10px',
                background: 'transparent', border: '1.5px solid var(--border)',
                borderRadius: 10, fontSize: 13, color: 'var(--text)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500,
              }}>
                + Agregar al carrito
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
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
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(79,70,229,.06)', border: '1px solid rgba(79,70,229,.15)', borderRadius: 10, fontSize: 12, color: 'var(--muted)' }}>
                Score total del mejor vendedor: <strong style={{ color: 'var(--acc)', fontSize: 16 }}>{Math.round((best?.score || 0) * 100)}/100</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
