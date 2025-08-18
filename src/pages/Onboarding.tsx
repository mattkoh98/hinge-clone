/**
 * Onboarding.tsx — Multi‑Step Profile Builder
 * -------------------------------------------
 * PURPOSE
 * - Guides a user through account method, basic info, photos, prompts, and review.
 *
 * RESPONSIBILITIES
 * - Manage stepper UI (Welcome → Method → Basic → Photos → Prompts → Review).
 * - Save draft to localStorage (`onboarding_draft`) after changes.
 * - On Finish: warn if optional sections incomplete, save `profile_v1`, go to `/swipe`.
 *
 * EXTENSION POINTS
 * - Replace localStorage with backend mutations later.
 * - Add validation, age rules, geolocation, reorderable photos, etc.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Gender = 'woman' | 'man' | 'nonbinary' | 'prefer_not_say'

type Draft = {
  accountMethod: 'email' | 'phone'
  basic: { name: string; email: string; dob: string; location: string; gender: Gender }
  photos: string[]
  prompts: { id: string; question: string; answer: string }[]
}

const DEFAULT_DRAFT: Draft = {
  accountMethod: 'email',
  basic: { name: '', email: '', dob: '', location: '', gender: 'prefer_not_say' },
  photos: [],
  prompts: [],
}

const PROMPT_BANK: { id: string; question: string }[] = [
  { id: 'p1', question: 'Two truths and a lie' },
  { id: 'p2', question: 'My weekend plans' },
  { id: 'p3', question: 'A green flag I look for' },
  { id: 'p4', question: 'The hallmark of a good relationship is…' },
  { id: 'p5', question: 'Unusual skills' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<number>(0)
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)

  // Load any existing signup data and draft
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_draft')
    const userRaw = localStorage.getItem('user')
    let next = DEFAULT_DRAFT
    if (saved) {
      try { next = { ...DEFAULT_DRAFT, ...JSON.parse(saved) } } catch {}
    }
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw)
        next = { ...next, basic: { ...next.basic, name: u.name || next.basic.name, email: u.email || next.basic.email } }
      } catch {}
    }
    setDraft(next)
  }, [])

  // Persist draft on change
  useEffect(() => {
    try { localStorage.setItem('onboarding_draft', JSON.stringify(draft)) } catch {}
  }, [draft])

  const canNext = useMemo(() => {
    if (step === 0) return true
    if (step === 1) return true // method choice
    if (step === 2) {
      const { name, email, dob, location } = draft.basic
      return name.trim() && email.trim() && dob.trim() && location.trim()
    }
    if (step === 3) return true // Photos optional
    if (step === 4) return true // Prompts optional
    return true
  }, [step, draft])

  function next() { if (canNext) setStep(s => Math.min(s + 1, steps.length - 1)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  function finish() {
    const missing: string[] = []
    const photosMissing = !draft.photos || draft.photos.length === 0
    const promptsMissing = !draft.prompts || draft.prompts.length === 0 || draft.prompts.some(p => !p.answer.trim())
    if (photosMissing) missing.push('photos')
    if (promptsMissing) missing.push('prompts')
    if (missing.length) {
      alert(`Heads up: your ${missing.join(' and ')} aren't complete yet. You can finish now and add them later in your profile.`)
    }

    const profile = { ...draft, completedAt: Date.now() }
    try { localStorage.setItem('profile_v1', JSON.stringify(profile)) } catch {}
    navigate('/swipe', { replace: true })
  }

  async function handlePhotos(files: FileList | null) {
    if (!files) return
    const toRead = Array.from(files).slice(0, 6)
    const dataUrls = await Promise.all(toRead.map(f => fileToDataURL(f)))
    setDraft(d => ({ ...d, photos: [...d.photos, ...dataUrls].slice(0, 6) }))
  }

  function togglePrompt(id: string) {
    const meta = PROMPT_BANK.find(p => p.id === id)!
    setDraft(d => {
      const exists = d.prompts.find(p => p.id === id)
      if (exists) return { ...d, prompts: d.prompts.filter(p => p.id !== id) }
      if (d.prompts.length >= 3) return d
      return { ...d, prompts: [...d.prompts, { id, question: meta.question, answer: '' }] }
    })
  }

  function updatePromptAnswer(id: string, answer: string) {
    setDraft(d => ({ ...d, prompts: d.prompts.map(p => p.id === id ? { ...p, answer } : p) }))
  }

  const steps = [
    { key: 'welcome', title: 'Welcome', content: (
      <div>
        <h1>Welcome to HingeClone 👋</h1>
        <p style={{ opacity: 0.8 }}>We’ll set up your profile in a few steps.</p>
      </div>
    )},
    { key: 'method', title: 'Account method', content: (
      <div>
        <h2>How do you want to sign in?</h2>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={() => setDraft(d => ({ ...d, accountMethod: 'email' }))} aria-pressed={draft.accountMethod === 'email'} style={{ padding: '8px 12px', borderRadius: 6, border: draft.accountMethod === 'email' ? '2px solid #111827' : '1px solid #e5e7eb' }}>Email</button>
          <button onClick={() => setDraft(d => ({ ...d, accountMethod: 'phone' }))} aria-pressed={draft.accountMethod === 'phone'} style={{ padding: '8px 12px', borderRadius: 6, border: draft.accountMethod === 'phone' ? '2px solid #111827' : '1px solid #e5e7eb' }}>Phone number</button>
        </div>
        <p style={{ marginTop: 8, opacity: 0.8 }}>(For MVP we’ll keep using your local demo login.)</p>
      </div>
    )},
    { key: 'basic', title: 'Basic info', content: (
      <div style={{ display: 'grid', gap: 12 }}>
        <label>Name
          <input value={draft.basic.name} onChange={e => setDraft(d => ({ ...d, basic: { ...d.basic, name: e.target.value } }))} placeholder="Your name" />
        </label>
        <label>Email
          <input type="email" value={draft.basic.email} onChange={e => setDraft(d => ({ ...d, basic: { ...d.basic, email: e.target.value.toLowerCase() } }))} placeholder="you@example.com" />
        </label>
        <label>Date of birth
          <input type="date" value={draft.basic.dob} onChange={e => setDraft(d => ({ ...d, basic: { ...d.basic, dob: e.target.value } }))} />
        </label>
        <label>Location (city)
          <input value={draft.basic.location} onChange={e => setDraft(d => ({ ...d, basic: { ...d.basic, location: e.target.value } }))} placeholder="e.g., Austin, TX" />
        </label>
        <label>Gender
          <select value={draft.basic.gender} onChange={e => setDraft(d => ({ ...d, basic: { ...d.basic, gender: e.target.value as Gender } }))}>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="nonbinary">Non-binary</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
        </label>
      </div>
    )},
    { key: 'photos', title: 'Photos', content: (
      <div>
        <p>Upload up to 6 photos (optional — you can add these later).</p>
        <input type="file" accept="image/*" multiple onChange={e => handlePhotos(e.target.files)} />
        {draft.photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
            {draft.photos.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={src} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <button onClick={() => setDraft(d => ({ ...d, photos: d.photos.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: 6, right: 6, padding: '4px 6px', borderRadius: 6 }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    )},
    { key: 'prompts', title: 'Prompts', content: (
      <div>
        <p>Choose up to 3 prompts and add answers (optional — you can finish and complete later).</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PROMPT_BANK.map(p => (
            <button key={p.id} onClick={() => togglePrompt(p.id)} style={{ padding: '6px 10px', borderRadius: 16, border: draft.prompts.some(x => x.id === p.id) ? '2px solid #111827' : '1px solid #e5e7eb' }}>
              {p.question}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {draft.prompts.map(p => (
            <label key={p.id}>{p.question}
              <textarea value={p.answer} onChange={e => updatePromptAnswer(p.id, e.target.value)} placeholder="Your answer" rows={3} />
            </label>
          ))}
        </div>
      </div>
    )},
    { key: 'review', title: 'Review', content: (
      <div style={{ display: 'grid', gap: 12 }}>
        <h2>Review your profile</h2>
        <div><strong>Name:</strong> {draft.basic.name}</div>
        <div><strong>Email:</strong> {draft.basic.email}</div>
        <div><strong>DOB:</strong> {draft.basic.dob}</div>
        <div><strong>Location:</strong> {draft.basic.location}</div>
        <div><strong>Gender:</strong> {draft.basic.gender}</div>
        {draft.photos.length > 0 && (
          <div>
            <strong>Photos:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
              {draft.photos.map((src, i) => (
                <img key={i} src={src} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              ))}
            </div>
          </div>
        )}
        {draft.prompts.length > 0 && (
          <div>
            <strong>Prompts:</strong>
            <ul>
              {draft.prompts.map(p => (
                <li key={p.id}><em>{p.question}:</em> {p.answer}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )},
  ]

  const stepMeta = steps[step]

  return (
    <div style={{ maxWidth: 640, margin: '32px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Onboarding</h1>
        <div style={{ opacity: 0.75 }}>Step {step + 1} / {steps.length}: {stepMeta.title}</div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        {stepMeta.content}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={back} disabled={step === 0} style={{ padding: '8px 12px', borderRadius: 6 }}>Back</button>
        {(step === 3 || step === 4) && (
          <button onClick={() => setStep(s => Math.min(s + 1, steps.length - 1))} style={{ padding: '8px 12px', borderRadius: 6 }}>Skip for now</button>
        )}
        {step < steps.length - 1 ? (
          <button onClick={next} disabled={!canNext} style={{ padding: '8px 12px', borderRadius: 6 }}>Next</button>
        ) : (
          <button onClick={finish} disabled={!canNext} style={{ padding: '8px 12px', borderRadius: 6 }}>Finish</button>
        )}
      </div>
    </div>
  )
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
}
