import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'

type Message = { id: number; from: 'me' | 'them'; text: string }

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

  // Persist on change
  useEffect(() => {
    if (!id) return
    try { localStorage.setItem(threadKey, JSON.stringify(messages)) } catch {}
  }, [id, messages])

  const title = useMemo(() => `Conversation #${id}`, [id])

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