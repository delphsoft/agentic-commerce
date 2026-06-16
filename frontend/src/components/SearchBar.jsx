import { useState, useRef } from 'react'

export default function SearchBar({ onSearch, onSetAgent }) {
  const [q, setQ] = useState('')
  const [recording, setRecording] = useState(false)
  const inputRef = useRef()

  const HINTS = ['notebook para editar video', 'aire split 3000F', 'iPhone 15 con cuotas', 'heladera no frost']

  function submit(val) {
    const v = val ?? q
    if (!v.trim()) return
    setQ(v)
    onSearch(v)
  }

  function toggleMic() {
    if (recording) return
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      onSetAgent('Tu navegador no soporta búsqueda por voz. Probá Chrome.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'es-AR'
    rec.interimResults = false
    setRecording(true)
    onSetAgent('🎤 Escuchando... hablá ahora.')
    rec.start()
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setQ(text)
      setRecording(false)
      onSearch(text)
    }
    rec.onerror = () => { setRecording(false); onSetAgent('No se pudo escuchar. Intentá de nuevo.') }
    rec.onend = () => setRecording(false)
  }

  function openCamera() {
    onSetAgent('📸 Cámara activada. Apuntá al producto — Claude Vision lo identifica. (Próximamente)')
  }

  return (
    <div style={{ padding: '40px 28px 28px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
      {/* Eyebrow */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, color: 'var(--acc)',
        background: 'rgba(79,70,229,.08)', border: '1px solid rgba(79,70,229,.18)',
        borderRadius: 'var(--radius-pill)', padding: '4px 14px', marginBottom: 20,
      }}>
        <span style={{ fontSize: 13 }}>+</span>
        Comparador agéntico · Argentina
      </div>

      {/* H1 */}
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800,
        lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 16, color: 'var(--text)',
      }}>
        Encontrá el mejor precio,<br />te lo busca el agente.
      </h1>

      <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
        Comparamos precio, reputación, envío y promos bancarias en 8 tiendas argentinas. Pedile lo que necesitás.
      </p>

      {/* Search bar */}
      <div style={{
        background: 'var(--surf)', border: '2px solid var(--acc)',
        borderRadius: 'var(--radius-lg)', padding: '6px 6px 6px 18px',
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        boxShadow: '0 0 0 4px rgba(79,70,229,.08)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--acc)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <i className="ti ti-sparkles" style={{ color: '#fff', fontSize: 16 }} aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Describí lo que buscás... ej: 'aire acondicionado split hasta $700k con cuotas'"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 14,
            padding: '8px 0',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={toggleMic} title="Buscar por voz" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: recording ? '#E8002D' : 'var(--muted)',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, animation: recording ? 'flash 1s infinite' : 'none',
          }}>
            <i className="ti ti-microphone" style={{ fontSize: 18 }} aria-hidden="true" />
          </button>
          <button onClick={openCamera} title="Buscar por imagen" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
          }}>
            <i className="ti ti-camera" style={{ fontSize: 18 }} aria-hidden="true" />
          </button>
          <button onClick={() => submit()} style={{
            background: '#1d1d1f', color: '#fff',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
            border: 'none', borderRadius: 10, padding: '10px 22px',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            Buscar
          </button>
        </div>
      </div>

      {/* Hints */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Probá:</span>
        {HINTS.map(h => (
          <span key={h} onClick={() => submit(h)} style={{
            fontSize: 12, color: 'var(--text)', background: 'var(--surf)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
            padding: '5px 14px', cursor: 'pointer', fontWeight: 400,
          }}>{h}</span>
        ))}
      </div>
    </div>
  )
}
