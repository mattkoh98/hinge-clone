// ================================================
// Swipe.tsx
// Purpose: Main discovery screen where users swipe
// left/right on potential matches. Access restricted
// to authenticated users only.
// ================================================
import { useMemo, useState } from 'react'

type Profile = {
  id: number
  name: string
  age: number
  prompt: string
}

const MOCK_PROFILES: Profile[] = [
  { id: 1, name: 'Alex', age: 27, prompt: 'Two truths and a lie: I love dumplings, ran a marathon, hate Sundays.' },
  { id: 2, name: 'Sam', age: 29, prompt: 'Perfect first date: tacos and a gallery walk.' },
  { id: 3, name: 'Jamie', age: 26, prompt: 'Green flags: kind to baristas, sends memes.' },
]

export default function Swipe() {
  const [index, setIndex] = useState(0)
  const profile = useMemo(() => MOCK_PROFILES[index], [index])

  function nextCard() {
    setIndex((i) => Math.min(i + 1, MOCK_PROFILES.length))
  }

  if (!profile) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
        <h2>Out of profiles for now</h2>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: 16 }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ height: 260, background: '#f3f4f6', borderRadius: 8, marginBottom: 12 }} />
        <h2 style={{ margin: 0 }}>{profile.name}, {profile.age}</h2>
        <p style={{ color: '#374151' }}>{profile.prompt}</p>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={nextCard} aria-label="pass" style={{ padding: '10px 16px' }}>Pass</button>
        <button onClick={nextCard} aria-label="like" style={{ padding: '10px 16px' }}>Like</button>
      </div>
    </div>
  )
}

