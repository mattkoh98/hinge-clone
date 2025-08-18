// ================================================
// Conversations.tsx
// Purpose: Displays a list of user conversations.
// Users can click into a conversation to open Chat.
// ================================================

import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

// Stored shape accommodates both legacy mocks (name) and new entries from LikesYou (partner)
export type StoredConversation = {
  id: number
  partner?: { id: number; name: string }
  name?: string
  lastMessage: string
  updatedAt?: number
}

// One-time legacy seed for nicer demo if nothing exists yet
const LEGACY_SEED: StoredConversation[] = [
  { id: 1, name: 'Alex',  lastMessage: 'See you Saturday? 🌮', updatedAt: Date.now() - 1000 * 60 * 60 * 3 },
  { id: 2, name: 'Sam',   lastMessage: 'That meme was hilarious 😂', updatedAt: Date.now() - 1000 * 60 * 60 * 5 },
  { id: 3, name: 'Jamie', lastMessage: 'Coffee tomorrow?', updatedAt: Date.now() - 1000 * 60 * 60 * 8 },
]

function loadConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem('conversations')
    if (raw) {
      const arr = JSON.parse(raw) as StoredConversation[]
      if (Array.isArray(arr)) return arr
    }
  } catch {}
  // seed with legacy data if none present (MVP demo)
  try { localStorage.setItem('conversations', JSON.stringify(LEGACY_SEED)) } catch {}
  return LEGACY_SEED
}

export default function Conversations() {
  const [items, setItems] = useState<StoredConversation[]>([])

  useEffect(() => {
    setItems(loadConversations())
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'conversations') setItems(loadConversations())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // newest first
  const list = useMemo(() => {
    return [...items].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  }, [items])

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: 16 }}>
      <h1>Conversations</h1>
      {list.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No conversations yet. When you match with someone, they’ll appear here.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {list.map((c) => {
            const displayName = c.partner?.name || c.name || 'Unknown'
            return (
              <li key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <Link to={`/conversations/${c.id}`} style={{ display: 'block', padding: '12px 4px', textDecoration: 'none' }}>
                  <div style={{ fontWeight: 600 }}>{displayName}</div>
                  <div style={{ color: '#374151' }}>{c.lastMessage}</div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
