import { useState } from 'react'

export default function ProductImage({ src, emoji, size = 60, style = {} }) {
  const [error, setError] = useState(false)
  const showImg = src && src !== '' && src !== '#' && !error

  if (showImg) {
    return (
      <div style={{
        width: '100%', aspectRatio: '1', background: '#f5f5f7',
        borderRadius: 10, overflow: 'hidden', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
        <img
          src={src}
          alt=""
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
