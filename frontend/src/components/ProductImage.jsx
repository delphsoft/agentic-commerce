import { useState } from 'react'

// Proxy todas las imágenes externas a través de wsrv.nl para evitar CORS y hotlink blocks
function proxyUrl(src) {
  if (!src || src === '#') return ''
  if (src.startsWith('data:')) return src
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=300&h=300&fit=contain&output=webp`
}

export default function ProductImage({ src, emoji, size = 60, style = {} }) {
  const [error, setError] = useState(false)
  const finalSrc = proxyUrl(src)
  const showImg = finalSrc && finalSrc !== '' && finalSrc !== '#' && !error

  if (showImg) {
    return (
      <div style={{
        width: '100%', aspectRatio: '1', background: '#f5f5f7',
        borderRadius: 10, overflow: 'hidden', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
        <img
          src={finalSrc}
          alt=""
          loading="lazy"
          onError={() => setError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', aspectRatio: '1', background: '#f0f0f3',
      borderRadius: 10, display: 'flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: 12, ...style,
    }}>
      <div style={{
        width: size, height: size, background: '#e4e4ea',
        borderRadius: 8, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.45,
      }}>{emoji || '📦'}</div>
    </div>
  )
}
