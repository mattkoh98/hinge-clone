// ================================================
// LikesYou.tsx
// Purpose: Show incoming likes (people who liked you) and
// let you Match or Skip — like Hinge's Likes You tab.
// ================================================

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ---- Types ----
type Prompt = { id: string; question: string; answer: string }

type Profile = {
  id: number
  name: string
  age: number
  photos: string[]
  prompts: Prompt[]
  location?: string
}

type IncomingLike = {
  at: number
  fromProfile: Profile
  context?: { photoIndex?: number; promptId?: string }
  comment?: string
}

// ---- Demo seed ----
const PLACEHOLDER = 'https://picsum.photos/seed/'
const DEMO_PROFILES: Profile[] = [
  {
    id: 101,
    name: 'Taylor',
    age: 28,
    location: 'San Diego, CA',
    photos: [ `${PLACEHOLDER}taylor1/600/400`, `${PLACEHOLDER}taylor2/600/400` ],
    prompts: [ { id: 'p1', question: 'Perfect Sunday', answer: 'Beach + burritos.' } ],
  },
  {
    id: 102,
    name: 'Riley',
    age: 30,
    location: 'Denver, CO',
    photos: [ `${PLACEHOLDER}riley1/600/400` ],
    prompts: [ { id: 'p2', question: 'Green flags', answer: 'Asks follow-up questions.' } ],
  },
  {
    id: 103,
    name: 'Jordan',
    age: 26,
    location: 'Chicago, IL',
    photos: [ `${PLACEHOLDER}jordan1/600/400`, `${PLACEHOLDER}jordan2/600/400`, `${PLACEHOLDER}jordan3/600/400` ],
    prompts: [ { id: 'p3', question: 'My hot take', answer: 'Pineapple does belong on pizza.' } ],
  },
]

function seedIncomingLikesIfEmpty(): IncomingLike[] {
  const raw = localStorage.getItem('incoming_likes')
  if (raw) {
    try { return JSON.parse(raw) as IncomingLike[] } catch {}
  }
  const seeded: IncomingLike[] = [
    { at: Date.now() - 1000 * 60 * 5,  fromProfile: DEMO_PROFILES[0], context: { photoIndex: 0 }, comment: 'Love this surf pic!' },
    { at: Date.now() - 1000 * 60 * 25, fromProfile: DEMO_PROFILES[1], context: { promptId: 'p2' } },
    { at: Date.now() - 1000 * 60 * 60, fromProfile: DEMO_PROFILES[2] },
  ]
  localStorage.setItem('incoming_likes', JSON.stringify(seeded))
  return seeded
}

function seedEmptyThread(convoId: number) {
  try { localStorage.setItem(`thread_${convoId}`, JSON.stringify([])) } catch {}
}

export default function LikesYou() {
  const navigate = useNavigate()
  const [likes, setLikes] = useState<IncomingLike[]>([])

  useEffect(() => {
    setLikes(seedIncomingLikesIfEmpty())
  }, [])

  function save(next: IncomingLike[]) {
    setLikes(next)
    try { localStorage.setItem('incoming_likes', JSON.stringify(next)) } catch {}
  }

  function handleSkip(idx: number) {
    const next = likes.filter((_, i) => i !== idx)
    save(next)
  }

  function handleMatch(idx: number) {
    const like = likes[idx]
    let convoId: number | null = null
    // 1) append to conversations (MVP local)
    try {
      const raw = localStorage.getItem('conversations')
      const list = raw ? (JSON.parse(raw) as any[]) : []
      const newId = (list[list.length - 1]?.id ?? 0) + 1
      list.push({
        id: newId,
        partner: { id: like.fromProfile.id, name: like.fromProfile.name },
        lastMessage: like.comment ? `You: ${like.comment}` : 'Matched! Start the convo ✨',
        updatedAt: Date.now(),
      })
      localStorage.setItem('conversations', JSON.stringify(list))
      seedEmptyThread(newId)
      convoId = newId
    } catch {}

    // 2) remove from incoming likes
    handleSkip(idx)

    // 3) navigate to the new conversation (if created)
    if (convoId != null) {
      navigate(`/conversations/${convoId}`)
    }
  }

  const empty = likes.length === 0

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 16 }}>
      <h1>Likes you</h1>
      {empty ? (
        <p style={{ opacity: 0.7 }}>No new likes right now. Check back later!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 16 }}>
          {likes.map((like, idx) => (
            <li key={like.at + '_' + like.fromProfile.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              {/* top: photo */}
              <div style={{ position: 'relative', background: '#000' }}>
                <img
                  src={like.fromProfile.photos[0]}
                  alt={`${like.fromProfile.name} main photo`}
                  style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 8, left: 8, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                  <strong>{like.fromProfile.name}, {like.fromProfile.age}</strong>
                  {like.fromProfile.location ? <div style={{ fontSize: 12 }}>{like.fromProfile.location}</div> : null}
                </div>
              </div>

              {/* details */}
              <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                {like.comment && (
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Their comment</div>
                    <div>{like.comment}</div>
                  </div>
                )}

                {like.context?.promptId && (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Liked a prompt</div>
                )}
                {typeof like.context?.photoIndex === 'number' && (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Liked photo #{(like.context!.photoIndex! + 1)}</div>
                )}

                {/* actions */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => handleSkip(idx)} style={{ padding: '8px 12px', borderRadius: 8 }}>Skip</button>
                  <button onClick={() => handleMatch(idx)} style={{ background: '#111827', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Match</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
