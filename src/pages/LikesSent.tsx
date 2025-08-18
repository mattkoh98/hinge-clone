// ================================================
// LikesSent.tsx
// Purpose: Debug view listing likes you have sent
// (from Swipe), including context and optional comment.
// ================================================

import { useEffect, useState } from 'react'

type OutgoingLike = {
  at: number
  toProfileId: number
  context?: { photoIndex?: number; promptId?: string }
  comment?: string
}

export default function LikesSent() {
  const [items, setItems] = useState<OutgoingLike[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('outgoing_likes')
      const arr = raw ? (JSON.parse(raw) as OutgoingLike[]) : []
      setItems(arr)
    } catch { setItems([]) }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'outgoing_likes') {
        try {
          const raw2 = localStorage.getItem('outgoing_likes')
          const arr2 = raw2 ? (JSON.parse(raw2) as OutgoingLike[]) : []
          setItems(arr2)
        } catch { setItems([]) }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 16 }}>
      <h1>Likes Sent (debug)</h1>
      {items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No outgoing likes yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {items.map((it, idx) => (
            <li key={it.at + '_' + idx} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>To profile #{it.toProfileId}</strong>
                <span style={{ opacity: 0.7, fontSize: 12 }}>{new Date(it.at).toLocaleString()}</span>
              </div>
              {it.comment ? (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Your comment</div>
                  <div>{it.comment}</div>
                </div>
              ) : null}
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                Context: {it.context?.promptId ? `prompt ${it.context.promptId}` : `photo ${(it.context?.photoIndex ?? 0) + 1}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
