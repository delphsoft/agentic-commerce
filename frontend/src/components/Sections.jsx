import { useState } from 'react'
import { SRC, CAT_EMOJI, MOCK_MAS_BUSCADOS, MOCK_RECENT_OFFERS, MOCK_TOP_CATS, GUIDE_TIPS } from '../data/mock'

function fmt(n) { return 'ARS $' + Math.round(n).toLocaleString('es-AR') }

const STRIP_STYLE = {
  display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
}

/* ── Helpers ── */
function SectionHeader({ title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{title}</h2>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{right}</span>
    </div>
  )
}

function SrcBadge({ src, size = 9 }) {
  const s = SRC[src] || { label: src, bg: '#444', tc: '#fff' }
  return <span style={{ background: s.bg, color: s.tc, fontSize: size, fontWeight: 700, borderRadius: 4, padding: '1px 5px' }}>{s.label}</span>
}

/* ── MÁS BUSCADOS ── */
export function MasBuscados({ onSelect }) {
  const RANK_COLORS = ['#F0A500', '#B0B0B0', '#8B5E3C', 'var(--muted)', 'var(--muted)']
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <SectionHeader title="🔍 Más buscados hoy" right="Actualizado hace 12 min" />
      <div style={STRIP_STYLE}>
        {MOCK_MAS_BUSCADOS.map(p => (
          <div key={p.id} onClick={() => onSelect(p.id)} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '10px 12px', minWidth: 150, maxWidth: 150, cursor: 'pointer', flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, color: RANK_COLORS[p.rank - 1], marginBottom: 4 }}>#{p.rank} más buscado</div>
            <div style={{ fontSize: 24, marginBottom: 5 }}>{p.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{fmt(p.price)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <SrcBadge src={p.src} />
              <span style={{ fontSize: 9, color: 'var(--muted)' }}>{p.searches}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── OFERTAS RECIENTES ── */
export function OfertasRecientes({ onSelect }) {
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <SectionHeader title="🔥 Puestos en oferta recientemente" right="Últimas 24hs" />
      <div style={STRIP_STYLE}>
        {MOCK_RECENT_OFFERS.map(o => (
          <div key={o.id} onClick={() => onSelect(o.id)} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '10px 12px', minWidth: 155, maxWidth: 155, cursor: 'pointer', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <SrcBadge src={o.src} />
              <span style={{ fontSize: 9, color: '#E8002D', fontWeight: 700, background: 'rgba(232,0,45,.1)', border: '1px solid rgba(232,0,45,.2)', borderRadius: 4, padding: '1px 5px' }}>-{o.disc}%</span>
            </div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{o.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{fmt(o.price)}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)', textDecoration: 'line-through' }}>{fmt(o.oldPrice)}</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--muted)' }}>{o.when}</div>
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
  const RANK_CL = [{ bg: '#F0A500', tc: '#000' }, { bg: '#B0B0B0', tc: '#000' }, { bg: '#8B5E3C', tc: '#fff' }]
  const items = MOCK_TOP_CATS[cat] || []

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
            📊 Lo más vendido · <span style={{ color: 'var(--acc)' }}>{CATS[cat]}</span>
          </h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.entries(CATS).map(([key, label]) => (
              <button key={key} onClick={() => setCat(key)} style={{
                background: 'none', border: `1px solid ${cat === key ? 'var(--acc)' : 'var(--border)'}`,
                borderRadius: 20, padding: '3px 9px', fontSize: 10,
                color: cat === key ? 'var(--acc)' : 'var(--muted)',
                background: cat === key ? 'rgba(79,70,229,.1)' : 'none', cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)' }}>
          {items.map((p, i) => {
            const rc = RANK_CL[i] || { bg: 'var(--surf2)', tc: 'var(--muted)' }
            return (
              <div key={i} onClick={() => onSelect(p.id)} style={{ background: 'var(--card)', padding: '10px 11px', cursor: 'pointer' }}>
                <div style={{ width: 15, height: 15, borderRadius: '50%', background: rc.bg, color: rc.tc, fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>{p.rank}</div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{p.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 500, lineHeight: 1.3, marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{fmt(p.price)}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)' }}>{p.meta} · <SrcBadge src={p.src} size={8} /></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── GUÍA DE BÚSQUEDA ── */
export function GuiaBusqueda({ onSearch }) {
  const [guideQ, setGuideQ] = useState('')
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <SectionHeader title="💡 Cómo buscar mejor" right="Tips del agente" />
      <div style={{ background: 'var(--surf)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 3 }}>El agente entiende lenguaje natural</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>No hace falta saber el modelo exacto. Describí lo que necesitás.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          {GUIDE_TIPS.map((tip, i) => (
            <div key={i} style={{ background: 'var(--card)', padding: '12px 14px' }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{tip.ico}</div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{tip.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{tip.desc}</div>
              {tip.example && (
                <div onClick={() => onSearch(tip.example)} style={{ fontSize: 10, color: 'var(--acc)', marginTop: 5, cursor: 'pointer' }}>
                  → "{tip.example}"
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            value={guideQ}
            onChange={e => setGuideQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && guideQ && onSearch(guideQ)}
            placeholder='Probá: "heladera grande para familia, bajo $700k"'
            style={{ flex: 1, background: 'var(--surf2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-sans)' }}
          />
          <button onClick={() => guideQ && onSearch(guideQ)} style={{ background: 'var(--acc)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
            Buscar →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── FILTROS + AGENT BAR ── */
export function Filters({ activeCat, onSetCat }) {
  const CATS = ['Todos', 'Electrónica', 'Celulares', 'Hogar', 'Moda', 'Computación']
  const CAT_KEYS = { 'Todos': 'todos', 'Electrónica': 'electronica', 'Celulares': 'celulares', 'Hogar': 'hogar', 'Moda': 'moda', 'Computación': 'computacion' }
  const EMO = { 'Electrónica': '📱', 'Celulares': '📲', 'Hogar': '🏠', 'Moda': '👟', 'Computación': '💻' }
  return (
    <div style={{ padding: '0 20px 12px', display: 'flex', gap: 5, overflowX: 'auto' }}>
      {CATS.map(c => {
        const key = CAT_KEYS[c]
        const active = activeCat === key
        return (
          <span key={c} onClick={() => onSetCat(key)} style={{
            background: active ? 'rgba(79,70,229,.1)' : 'var(--surf)',
            border: `1px solid ${active ? 'var(--acc)' : 'var(--border)'}`,
            color: active ? 'var(--acc)' : 'var(--muted)',
            borderRadius: 20, padding: '5px 12px', fontSize: 11,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{EMO[c] || ''} {c}</span>
        )
      })}
    </div>
  )
}

export function AgentBar({ message }) {
  return (
    <div style={{ margin: '0 20px 14px', background: 'var(--surf)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 12 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(79,70,229,.1)', border: '1px solid rgba(79,70,229,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>✦</div>
      <div style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--acc)' }}>Agente:</strong> {message}
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
    <div style={{ padding: '0 20px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>🛒 Todos los productos</h2>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{displayed.length} productos</span>
      </div>
      {displayed.length === 0
        ? <p style={{ color: 'var(--muted)', fontSize: 12 }}>Sin resultados.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 9 }}>
            {displayed.map(p => {
              const best = p.best_offer || p.offers?.[0]
              const src = best?.source || best?.src
              const s = SRC[src] || { label: src, bg: '#444', tc: '#fff' }
              const ep = getEffectivePrice(p)
              const emoji = p.emoji || CAT_EMOJI[p.category || p.cat] || '📦'
              const hasDisc = best?.oldPrice && best.oldPrice > best.price
              const disc = hasDisc ? Math.round((1 - best.price / best.oldPrice) * 100) : 0

              return (
                <div key={p.id} onClick={() => onSelect(p.id)} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color .15s, transform .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,70,229,.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surf2)', fontSize: 30, padding: 14 }}>{emoji}</div>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ background: s.bg, color: s.tc, fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '1px 5px' }}>{s.label}</span>
                      {disc > 0 && <span style={{ fontSize: 9, color: '#E8002D', fontWeight: 700 }}>-{disc}%</span>}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, textDecoration: ep ? 'line-through' : 'none', color: ep ? 'var(--muted)' : 'var(--text)', marginBottom: ep ? 2 : 3 }}>{fmt(best?.price)}</div>
                    {ep && <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 500, marginBottom: 3 }}>💳 {fmt(ep)} con {selectedBanco.banco}</div>}
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                      {best?.shipping_cost === 0 ? '🟢 Envío gratis' : '📦'} · {(p.offers || []).length} vendedor{(p.offers || []).length > 1 ? 'es' : ''}
                    </div>
                    {best?.gmb_verified && best?.gmb_rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 9, color: 'var(--muted)' }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#34A853', display: 'inline-block' }} />
                        <span style={{ color: '#F0A500' }}>{'★'.repeat(Math.floor(best.gmb_rating))}</span>
                        <span>{best.gmb_rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
