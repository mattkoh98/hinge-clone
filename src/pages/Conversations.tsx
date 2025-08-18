import { Link } from 'react-router-dom'

type Conversation = {
  id: number
  name: string
  lastMessage: string
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Alex', lastMessage: 'See you Saturday? 🌮' },
  { id: 2, name: 'Sam', lastMessage: 'That meme was hilarious 😂' },
  { id: 3, name: 'Jamie', lastMessage: 'Coffee tomorrow?' },
]

export default function Conversations() {
  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: 16 }}>
      <h1>Conversations</h1>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {MOCK_CONVERSATIONS.map((c) => (
          <li key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <Link to={`/conversations/${c.id}`} style={{ display: 'block', padding: '12px 4px', textDecoration: 'none' }}>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ color: '#374151' }}>{c.lastMessage}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
