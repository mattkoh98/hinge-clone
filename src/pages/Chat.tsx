// ================================================
// Chat.tsx
// Purpose: Handles 1-on-1 chat messaging between users.
// Displays message history and allows sending new messages.
// ================================================
import { useParams, Link, useLocation } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'

type Message = { id: number; from: 'me' | 'them'; text: string }

function getConversationMeta(id: string | number): { displayName: string; preview?: string } {
  try {
    const raw = localStorage.getItem('conversations')
    const arr = raw ? JSON.parse(raw) : []
    const conv = Array.isArray(arr) ? arr.find((c: any) => String(c?.id) === String(id)) : null
    if (conv) {
      const displayName = conv?.partner?.name || conv?.name || `Conversation #${id}`
      return { displayName, preview: conv?.lastMessage }
    }
  } catch {}
  return { displayName: `Conversation #${id}` }
}

// Simple defaults; we also persist to localStorage per thread
const DEFAULT_THREADS: Record<string, Message[]> = {
  '1': [
    { id: 1, from: 'them', text: 'Hey! Saturday still good? 🌮' },
    { id: 2, from: 'me',   text: 'Yep! 7pm works for me.' },
  ],
  '2': [
    { id: 1, from: 'them', text: 'Got any good memes today? 😂' },
    { id: 2, from: 'me',   text: 'Always. Sending one now.' },
  ],
  '3': [
    { id: 1, from: 'them', text: 'Coffee tomorrow?' },
    { id: 2, from: 'me',   text: 'Let’s do it ☕️' },
  ],
}

export default function Chat() {
  const { id = '' } = useParams()
  const location = useLocation() as any
  const nameFromState = (location?.state && (location.state as any).name) || undefined
  const meta = getConversationMeta(id)
  const displayName = nameFromState || meta.displayName

  const threadKey = `thread_${id}`
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  // Load from localStorage or defaults
  useEffect(() => {
    const raw = localStorage.getItem(threadKey)
    if (raw) {
      try { setMessages(JSON.parse(raw) as Message[]) }
      catch { setMessages(DEFAULT_THREADS[id] || []) }
    } else {
      setMessages(DEFAULT_THREADS[id] || [])
    }
  }, [id])

  // If the thread is empty, seed it with the conversation preview (when it looks like a real message)
  useEffect(() => {
    if (!id) return
    const seededKey = `thread_seeded_${id}`
    const alreadySeeded = localStorage.getItem(seededKey) === '1'
    if (alreadySeeded) return

    const preview = meta.preview?.trim()
    if (!preview) return
    // Avoid seeding generic system text like "Matched!"
    if (/^Matched!/i.test(preview)) {
      localStorage.setItem(seededKey, '1')
      return
    }

    let from: 'me' | 'them' = 'them'
    let text = preview
    // If the preview was saved as "You: ...", treat it as a sent message
    const m = /^You:\s*(.*)$/.exec(preview)
    if (m) { from = 'me'; text = m[1] }

    // Only seed when the current thread is empty
    const raw = localStorage.getItem(`thread_${id}`)
    const existing = raw ? (JSON.parse(raw) as Message[]) : []
    if (existing.length === 0) {
      const seeded: Message[] = [{ id: 1, from, text }]
      setMessages(seeded)
      try { localStorage.setItem(`thread_${id}`, JSON.stringify(seeded)) } catch {}
    }
    localStorage.setItem(seededKey, '1')
  }, [id])

  // Persist on change
  useEffect(() => {
    if (!id) return
    try { localStorage.setItem(threadKey, JSON.stringify(messages)) } catch {}
  }, [id, messages])

  const title = useMemo(() => displayName, [displayName])

  function send() {
    const txt = input.trim()
    if (!txt) return
    setMessages(prev => [...prev, { id: prev.length + 1, from: 'me', text: txt }])
    setInput('')
  }

  return (
    <div style={{ maxWidth: 560, margin: '24px auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Link to="/conversations" style={{ textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ margin: 0 }}>{title}</h1>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minHeight: 320 }}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No messages yet. Say hi! 👋</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {messages.map(m => (
              <li key={m.id} style={{ justifySelf: m.from === 'me' ? 'end' : 'start', maxWidth: '75%' }}>
                <div style={{
                  background: m.from === 'me' ? '#111827' : '#f3f4f6',
                  color: m.from === 'me' ? 'white' : '#111827',
                  borderRadius: 12,
                  padding: '8px 12px'
                }}>
                  {m.text}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
        />
        <button onClick={send} style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  )
}