import { MOCK_BANCO_PROMOS } from '../data/mock'

export default function BancoPromos({ selectedBanco, onSelectBanco }) {
  const promos = MOCK_BANCO_PROMOS
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const today = days[new Date().getDay()]

  return (
    <div style={{
      margin: '0 20px 16px',
      background: 'linear-gradient(135deg,#0D1F3C 0%,#0A1628 100%)',
      border: '1px solid #1E3A5F', borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid #1E3A5F',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#E8F4FD' }}>
            💳 Promociones bancarias activas
          </div>
          <div style={{ fontSize: 10, color: '#7AADCC', marginTop: 2 }}>
            {today} · Descuentos y cuotas s/i por banco
          </div>
        </div>
        <span style={{
          fontSize: 9, color: '#7ee0a0', background: 'rgba(126,224,160,.1)',
          border: '1px solid rgba(126,224,160,.2)', borderRadius: 20, padding: '2px 7px',
          animation: 'pulse 2s infinite',
        }}>● EN VIVO</span>
      </div>

      {/* Cards strip */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 14px' }}>
        {promos.map(b => {
          const isActive = selectedBanco?.id === b.id
          const isToday = b.dias.includes('Todos') || b.dias.includes(today)
          return (
            <div
              key={b.id}
              onClick={() => onSelectBanco(isActive ? null : b)}
              style={{
                background: isActive ? 'rgba(126,224,160,.08)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${isActive ? 'rgba(126,224,160,.5)' : isToday ? '#2A4A6F' : '#1E3A5F'}`,
                borderRadius: 9, padding: '9px 11px',
                minWidth: 155, maxWidth: 155, flexShrink: 0,
                cursor: 'pointer', transition: 'border-color .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: b.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, flexShrink: 0,
                }}>{b.initial}</div>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#E8F4FD' }}>{b.banco}</span>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#7ee0a0' }}>✓</span>}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                color: '#7ee0a0', marginBottom: 3,
              }}>{b.promo}</div>
              <div style={{ fontSize: 10, color: '#7AADCC', lineHeight: 1.4, marginBottom: 5 }}>{b.desc}</div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {b.dias.map(d => (
                  <span key={d} style={{
                    fontSize: 9, background: d === today || d === 'Todos' ? 'rgba(126,224,160,.1)' : 'rgba(55,138,221,.15)',
                    color: d === today || d === 'Todos' ? 'var(--acc)' : '#85B7EB',
                    borderRadius: 4, padding: '1px 5px',
                  }}>{d}</span>
                ))}
                {b.tags.map(t => (
                  <span key={t} style={{ fontSize: 9, background: 'rgba(55,138,221,.15)', color: '#85B7EB', borderRadius: 4, padding: '1px 5px' }}>{t}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer selector */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid #1E3A5F',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 10, color: '#7AADCC' }}>
          {selectedBanco ? `💳 ${selectedBanco.banco} activo — precios actualizados` : '¿Cuál es tu tarjeta?'}
        </span>
        <select
          value={selectedBanco?.id || ''}
          onChange={e => onSelectBanco(promos.find(b => b.id === e.target.value) || null)}
          style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid #1E3A5F',
            borderRadius: 6, padding: '4px 8px', fontSize: 10,
            color: '#E8F4FD', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">Seleccioná tu banco</option>
          {promos.map(b => <option key={b.id} value={b.id}>{b.banco}</option>)}
        </select>
      </div>
    </div>
  )
}
