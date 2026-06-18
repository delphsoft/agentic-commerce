import ProductImage from './ProductImage'
import { useState } from 'react'
import { SRC, CAT_EMOJI, MOCK_MAS_BUSCADOS, MOCK_RECENT_OFFERS, MOCK_TOP_CATS, GUIDE_TIPS } from '../data/mock'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-AR') }

function ImgPlaceholder({ emoji, size = 80 }) {
  return (
    <div style={{
      width: '100%', aspectRatio: '1', background: '#f0f0f3',
      borderRadius: 10, display: 'flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: 12,
    }}>
      <div style={{
        width: size, height: size, background: '#e4e4ea',
        borderRadius: 8, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.4,
      }}>{emoji || '📦'}</div>
    </div>
  )
}

function SrcBadge({ src, size = 10 }) {
  const s = SRC[src] || { label: src?.toUpperCase(), bg: '#444', tc: '#fff' }
  return (
    <span style={{
      background: s.bg, color: s.tc, fontSize: size, fontWeight: 700,
      borderRadius: 6, padding: '2px 7px', display: 'inline-block',
    }}>{s.label}</span>
  )
}

function SectionHeader({ title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{title}</h2>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{right}</span>
    </div>
  )
}

/* ── FILTERS ── */
export function Filters({ activeCat, onSetCat }) {
  const CATS = [
    { key: 'todos', label: 'Todos' },
    { key: 'electronica', label: 'Electrónica' },
    { key: 'celulares', label: 'Celulares' },
    { key: 'hogar', label: 'Hogar' },
    { key: 'moda', label: 'Moda' },
    { key: 'computacion', label: 'Computación' },
  ]
  return (
    <div style={{ padding: '0 28px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {CATS.map(c => {
        const active = activeCat === c.key
        return (
          <button key={c.key} onClick={() => onSetCat(c.key)} style={{
            background: active ? '#1d1d1f' : 'var(--surf)',
            color: active ? '#fff' : 'var(--text)',
            border: active ? 'none' : '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)', padding: '8px 18px',
            fontSize: 13, fontWeight: active ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>{c.label}</button>
        )
      })}
    </div>
  )
}

/* ── AGENT BAR ── */
export function AgentBar({ message }) {
  return (
    <div style={{
      margin: '0 28px 24px',
      background: 'var(--surf)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '12px 16px',
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'var(--acc)', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
      }}>
        <i className="ti ti-sparkles" style={{ color: '#fff', fontSize: 16 }} aria-hidden="true" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: 'var(--acc)',
              animation: `dots 1.4s ${i * 0.2}s infinite`,
            }} />
          ))}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>
          <strong>Agente</strong> · {message}
        </span>
      </div>
    </div>
  )
}

/* ── MÁS BUSCADOS ── */
export function MasBuscados({ onSelect, products = [] }) {
  const items = products.length > 0
    ? products.slice(0, 5).map((p, i) => ({
        id: p.id,
        rank: i + 1,
        src: p.best_offer?.source,
        image_url: p.image_url,
        emoji: CAT_EMOJI[p.category] || '📦',
        title: p.title,
        price: p.best_offer?.price,
        searches: p.best_offer?.score ? `Score ${p.best_offer.score}` : '',
      }))
    : MOCK_MAS_BUSCADOS

  return (
    <div style={{ padding: '0 28px 32px' }}>
      <SectionHeader title="Más buscados hoy" right="Actualizado hace 12 min" />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {items.map(p => (
          <div key={p.id} onClick={() => onSelect(p.id)} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 14,
            minWidth: 200, maxWidth: 200, cursor: 'pointer', flexShrink: 0,
            transition: 'box-shadow .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{
                background: '#1d1d1f', color: '#fff',
                fontSize: 11, fontWeight: 700, borderRadius: 6,
                padding: '2px 8px',
              }}>#{p.rank}</span>
              <SrcBadge src={p.src} />
            </div>
            <ProductImage src={p.image_url} emoji={p.emoji} size={64} />
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 6, color: 'var(--text)' }}>{p.title}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{fmt(p.price)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="ti ti-search" style={{ fontSize: 11 }} aria-hidden="true" />
              {p.searches}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── OFERTAS RECIENTES ── */
export function OfertasRecientes({ onSelect, products = [] }) {
  // Toma los productos 5-12 para no repetir los de MasBuscados
  const items = products.length > 5
    ? products.slice(5, 13).map(p => ({
        id: p.id,
        src: p.best_offer?.source,
        image_url: p.image_url,
        emoji: CAT_EMOJI[p.category] || '📦',
        title: p.title,
        price: p.best_offer?.price,
        oldPrice: null,
        disc: null,
        when: p.best_offer?.shipping_cost === 0 ? 'Envío gratis' : '',
      }))
    : MOCK_RECENT_OFFERS

  return (
    <div style={{ padding: '0 28px 32px' }}>
      <SectionHeader title="Puestos en oferta" right="Bajaron de precio hoy" />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {items.map(o => (
          <div key={o.id} onClick={() => onSelect(o.id)} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 14,
            minWidth: 210, maxWidth: 210, cursor: 'pointer', flexShrink: 0,
            transition: 'box-shadow .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <SrcBadge src={o.src} />
              {o.disc && <span style={{
                background: '#1a9e4a', color: '#fff',
                fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px',
              }}>-{o.disc}%</span>}
            </div>
            <ProductImage src={o.image_url} emoji={o.emoji} size={56} />
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 8, color: 'var(--text)' }}>{o.title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{fmt(o.price)}</span>
              {o.oldPrice && <span style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>{fmt(o.oldPrice)}</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.when}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── TOP CATEGORÍA ── */
export function TopCategoria({ onSelect }) {
  const [cat, setCat] = useState('electronica')
  const CATS = { electronica: 'Electrónica', hogar: 'Hogar', moda: 'Moda' }
  const RANK_STYLE = [
    { bg: '#F0A500', tc: '#000' },
    { bg: '#9ca3af', tc: '#000' },
    { bg: '#92745a', tc: '#fff' },
  ]
  const items = MOCK_TOP_CATS[cat] || []

  return (
    <div style={{ padding: '0 28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>
          Lo más vendido · <span style={{ color: 'var(--acc)' }}>{CATS[cat]}</span>
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(CATS).map(([key, label]) => (
            <button key={key} onClick={() => setCat(key)} style={{
              background: cat === key ? '#1d1d1f' : 'var(--surf)',
              color: cat === key ? '#fff' : 'var(--text)',
              border: cat === key ? 'none' : '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)', padding: '5px 14px',
              fontSize: 12, fontWeight: cat === key ? 600 : 400,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {items.map((p, i) => {
          const rc = RANK_STYLE[i] || { bg: '#e5e5ea', tc: '#666' }
          return (
            <div key={i} onClick={() => onSelect(p.id)} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 14, cursor: 'pointer',
              transition: 'box-shadow .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{
                  background: rc.bg, color: rc.tc, fontSize: 11, fontWeight: 700,
                  borderRadius: 6, padding: '2px 8px',
                }}>#{p.rank}</span>
                <SrcBadge src={p.src} />
              </div>
              <ProductImage src={p.image_url} emoji={p.emoji} size={56} />
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{fmt(p.price)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.meta}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── GUÍA ── */
export function GuiaBusqueda({ onSearch }) {
  const [guideQ, setGuideQ] = useState('')
  return (
    <div style={{ padding: '0 28px 32px' }}>
      <SectionHeader title="Cómo pedirle al agente" right="" />
      <div style={{ background: 'var(--surf)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          {GUIDE_TIPS.map((tip, i) => (
            <div key={i} style={{ background: 'var(--card)', padding: '16px 18px' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{tip.ico}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{tip.desc}</div>
              {tip.example && (
                <div onClick={() => onSearch(tip.example)} style={{
                  fontSize: 11, color: 'var(--acc)', marginTop: 6, cursor: 'pointer', fontWeight: 500,
                }}>→ "{tip.example}"</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <input
            value={guideQ}
            onChange={e => setGuideQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && guideQ && onSearch(guideQ)}
            placeholder='Probá: "heladera grande para familia, bajo $700k con envío gratis"'
            style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12,
              color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-sans)',
            }}
          />
          <button onClick={() => guideQ && onSearch(guideQ)} style={{
            background: 'var(--acc)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px', fontSize: 12,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}>Buscar →</button>
        </div>
      </div>
    </div>
  )
}

/* ── PRODUCT GRID ── */
export function ProductGrid({ products, activeCat, selectedBanco, onSelect }) {
  const displayed = activeCat === 'todos' ? products : products.filter(p => p.category === activeCat || p.cat === activeCat)

  function getEffectivePrice(p) {
    if (!selectedBanco) return null
    const best = p.best_offer || p.offers?.[0]
    if (!best) return null
    const storeMatch = !selectedBanco.stores?.length || selectedBanco.stores.includes(best.source || best.src)
    if (!storeMatch) return null
    if (selectedBanco.tipo === 'descuento') return Math.round(best.price * (1 - selectedBanco.pct / 100))
    return null
  }

  return (
    <div style={{ padding: '0 28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Todos los productos</h2>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{displayed.length} productos</span>
      </div>
      {displayed.length === 0
        ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin resultados.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {displayed.map(p => {
              const best = p.best_offer || p.offers?.[0]
              const src = best?.source || best?.src
              const ep = getEffectivePrice(p)
              const emoji = p.emoji || CAT_EMOJI[p.category || p.cat] || '📦'
              const hasDisc = best?.oldPrice && best.oldPrice > best.price
              const disc = hasDisc ? Math.round((1 - best.price / best.oldPrice) * 100) : 0

              return (
                <div key={p.id} onClick={() => onSelect(p.id)} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: 14, cursor: 'pointer',
                  transition: 'box-shadow .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <SrcBadge src={src} />
                    {disc > 0 && (
                      <span style={{ background: '#1a9e4a', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 6px' }}>-{disc}%</span>
                    )}
                  </div>
                  <ProductImage src={p.image_url} emoji={emoji} size={60} />
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 6 }}>{p.title}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                    textDecoration: ep ? 'line-through' : 'none',
                    color: ep ? 'var(--muted)' : 'var(--text)', marginBottom: ep ? 2 : 4,
                  }}>{fmt(best?.price)}</div>
                  {ep && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--acc)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                      {fmt(ep)} <span style={{ fontSize: 11, fontWeight: 500 }}>con {selectedBanco.banco}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {best?.shipping_cost === 0 ? '🟢 Envío gratis' : '📦 Ver envío'}
                    {' · '}{(p.offers || []).length} vendedor{(p.offers || []).length !== 1 ? 'es' : ''}
                  </div>
                  {best?.gmb_verified && best?.gmb_rating && (
                    <div style={{ fontSize: 10, color: '#34A853', marginTop: 3 }}>
                      📍 {best.gmb_name || 'Local verificado'} {best.gmb_rating}★
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
