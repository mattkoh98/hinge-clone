// ================================================
// Swipe.tsx
// Purpose: Main discovery screen where users swipe
// left/right on potential matches. Access restricted
// to authenticated users only.
// ================================================
import { useEffect, useMemo, useState } from 'react'

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

type OutgoingLike = {
  at: number
  toProfileId: number
  context?: { photoIndex?: number; promptId?: string }
  comment?: string
}

// ---- Mock Data (MVP) ----
const PLACEHOLDER = 'https://picsum.photos/seed/'
const MOCK_PROFILES: Profile[] = [
  {
    id: 1,
    name: 'Alex',
    age: 27,
    location: 'Austin, TX',
    photos: [
      `${PLACEHOLDER}alex1/600/400`,
      `${PLACEHOLDER}alex2/600/400`,
      `${PLACEHOLDER}alex3/600/400`,
    ],
    prompts: [
      { id: 'p1', question: 'Two truths and a lie', answer: 'I love dumplings; I ran a marathon; I hate Sundays.' },
      { id: 'p2', question: 'Perfect first date', answer: 'Tacos and a gallery walk.' },
    ],
  },
  {
    id: 2,
    name: 'Sam',
    age: 29,
    location: 'Seattle, WA',
    photos: [
      `${PLACEHOLDER}sam1/600/400`,
      `${PLACEHOLDER}sam2/600/400`,
    ],
    prompts: [
      { id: 'p1', question: 'Green flags', answer: 'Kind to baristas, sends memes.' },
      { id: 'p3', question: 'Weekend plans', answer: 'Hike in the morning, lazy brunch after.' },
    ],
  },
  {
    id: 3,
    name: 'Jamie',
    age: 26,
    location: 'NYC',
    photos: [
      `${PLACEHOLDER}jamie1/600/400`,
      `${PLACEHOLDER}jamie2/600/400`,
      `${PLACEHOLDER}jamie3/600/400`,
      `${PLACEHOLDER}jamie4/600/400`,
    ],
    prompts: [
      { id: 'p4', question: 'An unusual skill', answer: 'I can solve a Rubik’s cube under a minute.' },
    ],
  },
]

export default function Swipe() {
  // which profile & photo are in view
  const [cardIndex, setCardIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  // selected prompt (optional) to like
  const [selectedPromptId, setSelectedPromptId] = useState<string | undefined>()
  // like-with-comment UI
  const [isCommenting, setIsCommenting] = useState(false)
  const [comment, setComment] = useState('')

  const profile = useMemo(() => MOCK_PROFILES[cardIndex], [cardIndex])

  // reset sub-state when card changes
  useEffect(() => {
    setPhotoIndex(0)
    setSelectedPromptId(undefined)
    setComment('')
    setIsCommenting(false)
  }, [cardIndex])

  function nextCard() {
    setCardIndex(i => Math.min(i + 1, MOCK_PROFILES.length))
  }

  function prevPhoto() {
    if (!profile) return
    setPhotoIndex(i => (i === 0 ? profile.photos.length - 1 : i - 1))
  }
  function nextPhoto() {
    if (!profile) return
    setPhotoIndex(i => (i + 1) % profile.photos.length)
  }

  function handleSkip() {
    // For MVP, just advance. Optionally store skips later.
    nextCard()
  }

  function openLikeWithComment() {
    setIsCommenting(true)
  }

  function cancelComment() {
    setIsCommenting(false)
    setComment('')
  }

  function sendLike() {
    if (!profile) return
    const payload: OutgoingLike = {
      at: Date.now(),
      toProfileId: profile.id,
      context: {
        photoIndex: photoIndex,
        promptId: selectedPromptId,
      },
      comment: comment.trim() || undefined,
    }
    try {
      const prev = JSON.parse(localStorage.getItem('outgoing_likes') || '[]') as OutgoingLike[]
      prev.push(payload)
      localStorage.setItem('outgoing_likes', JSON.stringify(prev))
    } catch {}

    // advance to next card
    nextCard()
  }

  if (!profile) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '70vh', padding: 16 }}>
        <div>
          <h2>Out of profiles for now</h2>
          <p style={{ opacity: 0.7 }}>Check back later as new people join.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, margin: '32px auto', padding: 16 }}>
      {/* Profile Card */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {/* Photo carousel */}
        <div style={{ position: 'relative', background: '#000' }}>
          <img
            src={profile.photos[photoIndex]}
            alt={`${profile.name} photo ${photoIndex + 1}`}
            style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
          />
          <button onClick={prevPhoto} aria-label="Previous photo" style={navBtnStyle('left')}>‹</button>
          <button onClick={nextPhoto} aria-label="Next photo" style={navBtnStyle('right')}>›</button>
          {/* photo dots */}
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {profile.photos.map((_, i) => (
              <span key={i} style={{ width: 28, height: 3, background: i === photoIndex ? 'white' : 'rgba(255,255,255,0.4)', borderRadius: 3 }} />
            ))}
          </div>
        </div>

        {/* Basic info */}
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: 0 }}>{profile.name}, {profile.age}</h2>
          {profile.location && <div style={{ opacity: 0.7, marginTop: 4 }}>{profile.location}</div>}

          {/* Prompts list */}
          {profile.prompts?.length ? (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {profile.prompts.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPromptId(prev => prev === p.id ? undefined : p.id)}
                  style={{
                    textAlign: 'left',
                    border: selectedPromptId === p.id ? '2px solid #111827' : '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: '8px 10px',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.question}</div>
                  <div style={{ color: '#374151' }}>{p.answer}</div>
                  {selectedPromptId === p.id && (
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>Selected for like context</div>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 14 }}>
        <button onClick={handleSkip} aria-label="Skip" style={pillBtn('#e11d48', 'white')}>✕ Skip</button>
        <button onClick={openLikeWithComment} aria-label="Like" style={pillBtn('#10b981', 'white')}>♥ Like</button>
      </div>

      {/* Like with comment modal (simple inline panel for MVP) */}
      {isCommenting && (
        <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Send a like {selectedPromptId ? 'about this prompt' : 'for this photo'}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            Context: {selectedPromptId ? `prompt #${selectedPromptId}` : `photo ${photoIndex + 1}`} (optional)
          </div>
          <textarea
            placeholder="Add a comment to spark a convo (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={cancelComment}>Cancel</button>
            <button onClick={sendLike} style={{ background: '#111827', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Send like</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Styles ----
function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 6,
    background: 'rgba(0,0,0,0.45)',
    color: 'white',
    border: 'none',
    width: 34,
    height: 34,
    borderRadius: 999,
    cursor: 'pointer'
  } as React.CSSProperties
}

function pillBtn(bg: string, fg: string): React.CSSProperties {
  return {
    background: bg,
    color: fg,
    border: 'none',
    padding: '10px 16px',
    borderRadius: 999,
    cursor: 'pointer'
  }
}
