// Swipe.tsx
// Hinge-style swipe card with a SINGLE Like button.
// The user selects exactly one target: the CURRENT PHOTO or ONE PROMPT.
// They can add an optional comment, then press Like. Skip advances.

import React, { useEffect, useMemo, useState } from 'react'
import { sendLike as sendLikeService } from '../services/likes.service'

// ----- Types -----
interface Prompt { id: string; question: string; answer: string }
interface Profile {
  id: string
  name: string
  age?: number
  location?: string
  jobTitle?: string
  company?: string
  school?: string
  photos: string[]
  prompts: Prompt[]
}

type SelectedContext =
  | { kind: 'photo'; photoIndex: number }
  | { kind: 'prompt'; promptId: string }

// Absolute demo URLs (reliable anywhere) + a few prompts
const demoProfiles: Profile[] = [
  {
    id: 'p1',
    name: 'Sophie',
    age: 27,
    location: 'Austin, TX',
    jobTitle: 'Product Designer',
    company: 'Lumen',
    school: 'UT Austin',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop',
    ],
    prompts: [
      { id: 'p1_a', question: "I'm known for", answer: 'planning cozy dinner parties.' },
      { id: 'p1_b', question: 'A green flag I look for', answer: 'keeps their promises.' },
    ],
  },
  {
    id: 'p2',
    name: 'Liam',
    age: 29,
    location: 'Denver, CO',
    jobTitle: 'Data Analyst',
    company: 'PeakOps',
    school: 'CU Boulder',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop',
    ],
    prompts: [
      { id: 'p2_a', question: 'Two truths and a lie', answer: 'I ski, I bake, I hate dogs (lie).'},
      { id: 'p2_b', question: 'The hallmark of a good relationship is', answer: 'curiosity + patience.'},
    ],
  },
  {
    id: 'p3',
    name: 'Emma',
    age: 26,
    location: 'Seattle, WA',
    jobTitle: 'Software Engineer',
    company: 'Northwind',
    school: 'UW',
    photos: [
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&auto=format&fit=crop',
    ],
    prompts: [
      { id: 'p3_a', question: 'The quickest way to my heart is', answer: 'a good ramen recommendation.' },
      { id: 'p3_b', question: 'Typical Sunday', answer: 'farmers market then a bike ride.' },
    ],
  },
]

function ImgWithFallback({ src, alt, seed, size = 360, selected = false, onClick }: { src?: string; alt: string; seed: string; size?: number; selected?: boolean; onClick?: () => void }) {
  const [failed, setFailed] = useState(false)
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${Math.round(size * 0.66)}`
  const finalSrc = !src || failed ? fallback : src
  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={() => setFailed(true)}
      onClick={onClick}
      style={{
        width: '100%',
        height: size * 0.66,
        objectFit: 'cover',
        borderRadius: 12,
        display: 'block',
        outline: selected ? '3px solid #111827' : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    />
  )
}

export default function Swipe() {
  // which profile
  const [idx, setIdx] = useState(0)
  // which photo on the current profile
  const [photoIndex, setPhotoIndex] = useState(0)
  // selected target for the single Like button
  const [selected, setSelected] = useState<SelectedContext>({ kind: 'photo', photoIndex: 0 })
  // optional comment
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const profile = useMemo(() => demoProfiles[idx] ?? null, [idx])

  // keep selection in sync with changed profile/photo
  useEffect(() => {
    setPhotoIndex(0)
    setSelected({ kind: 'photo', photoIndex: 0 })
    setComment('')
  }, [idx])

  useEffect(() => {
    // if the user has photo selected, keep its index in sync with carousel
    setSelected((prev) => (prev.kind === 'photo' ? { kind: 'photo', photoIndex } : prev))
  }, [photoIndex])

  if (!profile) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
        <h2>Discover</h2>
        <p>No more profiles.</p>
      </div>
    )
  }

  const canPrev = photoIndex > 0
  const canNext = photoIndex < Math.max(0, (profile.photos?.length || 1) - 1)

  async function onLike() {
    if (submitting) return
    setSubmitting(true)
    try {
      // Build LikeContext from current selection
      const context = selected.kind === 'photo' ? { photoIndex: selected.photoIndex } : { promptId: selected.promptId }
      await sendLikeService({ id: profile.id, name: profile.name }, { comment, context })
      // advance to next profile
      setIdx((n) => n + 1)
      setComment('')
    } catch (err) {
      console.error('sendLike failed', err)
    } finally {
      setSubmitting(false)
    }
  }

  function onSkip() {
    if (submitting) return
    setIdx((n) => n + 1)
  }

  return (
    <div className="swipe-page" style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Discover</h2>

      {/* Photo carousel (clicking the image selects the current photo as the target) */}
      <div style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <ImgWithFallback
          src={profile.photos?.[photoIndex]}
          alt={`${profile.name}-photo-${photoIndex}`}
          seed={`${profile.id}-${photoIndex}`}
          size={420}
          selected={selected.kind === 'photo'}
          onClick={() => setSelected({ kind: 'photo', photoIndex })}
        />
        {/* Carousel controls */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => canPrev && setPhotoIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            style={{ marginLeft: 6, padding: '6px 10px', borderRadius: 8, opacity: canPrev ? 1 : 0.5 }}
          >
            ‹
          </button>
          <button
            onClick={() => canNext && setPhotoIndex((i) => i + 1)}
            disabled={!canNext}
            style={{ marginRight: 6, padding: '6px 10px', borderRadius: 8, opacity: canNext ? 1 : 0.5 }}
          >
            ›
          </button>
        </div>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', gap: 6, justifyContent: 'center' }}>
          {(profile.photos || []).map((_, i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: 999, background: i === photoIndex ? '#111827' : '#e5e7eb' }} />
          ))}
        </div>
      </div>

      {/* Header: name + basics */}
      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>
          {profile.name}
          {profile.age ? `, ${profile.age}` : ''}
        </h3>
        <div style={{ opacity: 0.8, fontSize: 14 }}>
          {[profile.jobTitle && profile.company ? `${profile.jobTitle} @ ${profile.company}` : profile.jobTitle || profile.company, profile.school, profile.location]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </div>

      {/* Prompts (select exactly one prompt OR the current photo) */}
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {(profile.prompts || []).map((p) => {
          const isSelected = selected.kind === 'prompt' && selected.promptId === p.id
          return (
            <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, outline: isSelected ? '2px solid #111827' : 'none' }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{p.question}</div>
              <div>{p.answer}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSelected({ kind: 'prompt', promptId: p.id })}
                  disabled={submitting}
                  style={{ padding: '6px 10px', borderRadius: 8 }}
                >
                  {isSelected ? '✓ Selected' : 'Select this prompt'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comment + actions */}
      <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
        <input
          placeholder={selected.kind === 'prompt' ? 'Say something about this prompt…' : `Say something about photo #${photoIndex + 1}…`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onLike} disabled={submitting} style={{ padding: '8px 12px', borderRadius: 8 }}>
            ❤️ Like
          </button>
          <button onClick={onSkip} disabled={submitting} style={{ padding: '8px 12px', borderRadius: 8 }}>
            ✖ Skip
          </button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Target: {selected.kind === 'prompt' ? `Prompt` : `Photo #${photoIndex + 1}`}</div>
      </div>
    </div>
  )
}