import { useState, useRef } from 'react'

export default function SearchBar({ onSearch, onSetAgent }) {
  const [q, setQ] = useState('')
  const [recording, setRecording] = useState(false)
  const inputRef = useRef()

  const HINTS = ['auriculares', 'smart tv', 'celular', 'heladera', 'zapatillas', 'notebook']

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
    rec.onerror = () => {
      setRecording(false)
      onSetAgent('No se pudo escuchar. Intentá de nuevo.')
    }
    rec.onend = () => setRecording(false)
  }

  function openCamera() {
    onSetAgent('📸 Cámara activada. Apuntá al producto — Claude Vision lo identifica. (Próximamente)')
  }

  return (
    <div style={{ padding: '28px 20px 18px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      {/* Eyebrow */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--acc)', background: 'rgba(79,70,229,.08)',
        border: '1px solid rgba(79,70,229,.2)', borderRadius: 20,
        padding: '3px 12px', marginBottom: 14,
      }}>
        <span style={{ width: 5, height: 5, background: 'var(--acc)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
        Comparador agéntico · Argentina
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700,
        lineHeight: 1.05, letterSpacing: '-.03em', marginBottom: 10,
      }}>
        Encontrá el mejor precio,<br /><span style={{ color: 'var(--acc)' }}>te lo busca el agente.</span>
      </h1>

      <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 18, maxWidth: 380, margin: '0 auto 18px' }}>
        Comparamos Frávega, Garbarino, Naldo, Musimundo y MELI. Precio real con tu banco incluido.
      </p>

      {/* Search input */}
      <div style={{
        background: 'var(--surf)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '4px 4px 4px 14px',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
      }}>
        <i className="ti ti-sparkles" style={{ color: 'var(--acc)', fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="¿Qué buscás? Ej: auriculares inalámbricos"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13, padding: '9px 0',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={toggleMic}
            title="Buscar por voz"
            style={{
              background: 'var(--surf2)', border: `1px solid ${recording ? '#E8002D' : 'var(--border)'}`,
              borderRadius: 8, width: 34, height: 34, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: recording ? '#E8002D' : 'var(--muted)',
              animation: recording ? 'flash 1s infinite' : 'none', flexShrink: 0,
            }}
          >
            <i className="ti ti-microphone" style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
          <button
            onClick={openCamera}
            title="Buscar por imagen"
            style={{
              background: 'var(--surf2)', border: '1px solid var(--border)',
              borderRadius: 8, width: 34, height: 34, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--muted)', flexShrink: 0,
            }}
          >
            <i className="ti ti-camera" style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
          <button
            onClick={() => submit()}
            style={{
              background: 'var(--acc)', color: '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              border: 'none', borderRadius: 9, padding: '9px 14px', cursor: 'pointer',
            }}
          >
            Buscar →
          </button>
        </div>
      </div>

      {/* Hints */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {HINTS.map(h => (
          <span
            key={h}
            onClick={() => submit(h)}
            style={{
              fontSize: 11, color: 'var(--muted)', background: 'var(--surf)',
              border: '1px solid var(--border)', borderRadius: 20,
              padding: '3px 10px', cursor: 'pointer',
            }}
          >{h}</span>
        ))}
      </div>
    </div>
  )
}
