// ================================================
// Profile.tsx — Purpose: Displays and allows editing of the user's own profile,
// including photos, prompts, and settings.
// ================================================

import { useEffect, useMemo, useState } from 'react'

type Gender = 'woman' | 'man' | 'nonbinary' | 'prefer_not_say'

type Prompt = { id: string; question: string; answer: string }

type ProfileV1 = {
  accountMethod: 'email' | 'phone'
  basic: { name: string; email: string; dob: string; location: string; gender: Gender }
  photos: string[]
  prompts: Prompt[]
  completedAt?: number
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileV1 | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileV1 | null>(null)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPrompt, setNewPrompt] = useState<{ question: string; answer: string }>({ question: '', answer: '' })

  // --- Load profile ---
  useEffect(() => {
    const raw = localStorage.getItem('profile_v1')
    if (raw) {
      try { setProfile(JSON.parse(raw) as ProfileV1) } catch { setProfile(null) }
    } else {
      // fallback: hydrate from signup `user` if profile hasn't been created yet
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        if (u) {
          const p: ProfileV1 = {
            accountMethod: 'email',
            basic: { name: u.name || '', email: u.email || '', dob: '', location: '', gender: 'prefer_not_say' },
            photos: [],
            prompts: [],
          }
          setProfile(p)
          localStorage.setItem('profile_v1', JSON.stringify(p))
        }
      } catch { /* noop */ }
    }
  }, [])

  // --- Computed completeness ---
  const completeness = useMemo(() => {
    const p = editing ? draft : profile
    if (!p) return 0
    let score = 0
    const { basic, photos, prompts } = p
    if (basic?.name) score += 1
    if (basic?.email) score += 1
    if (basic?.dob) score += 1
    if (basic?.location) score += 1
    if (basic?.gender) score += 1
    if (photos?.length) score += 1
    if (prompts?.length) score += 1
    return Math.round((score / 7) * 100)
  }, [profile, draft, editing])

  if (!profile) {
    return (
      <div style={{ maxWidth: 720, margin: '32px auto', padding: 16 }}>
        <h1>My Profile</h1>
        <p style={{ opacity: 0.8 }}>No profile found yet. Complete onboarding to set up your profile.</p>
      </div>
    )
  }

  const data = editing && draft ? draft : profile
  const { basic, photos, prompts, completedAt } = data

  // --- Handlers ---
  function beginEdit() {
    setDraft(JSON.parse(JSON.stringify(profile)))
    setEditing(true)
  }
  function cancelEdit() {
    setEditing(false)
    setDraft(null)
    setNewPhotoUrl('')
    setNewPrompt({ question: '', answer: '' })
  }
  function saveEdit() {
    if (!draft) return
    const next: ProfileV1 = {
      ...draft,
      completedAt: draft.completedAt || Date.now(),
    }
    setProfile(next)
    try { localStorage.setItem('profile_v1', JSON.stringify(next)) } catch {}
    setEditing(false)
    setDraft(null)
    alert('Profile saved ✅')
  }

  function updateBasic<K extends keyof ProfileV1['basic']>(key: K, value: ProfileV1['basic'][K]) {
    if (!draft) return
    setDraft({ ...draft, basic: { ...draft.basic, [key]: value } })
  }
  function updateGender(value: Gender) {
    if (!draft) return
    setDraft({ ...draft, basic: { ...draft.basic, gender: value } })
  }

  function addPhoto() {
    if (!draft) return
    const url = newPhotoUrl.trim()
    if (!url) return
    setDraft({ ...draft, photos: [...draft.photos, url] })
    setNewPhotoUrl('')
  }
  function removePhoto(idx: number) {
    if (!draft) return
    const next = draft.photos.filter((_, i) => i !== idx)
    setDraft({ ...draft, photos: next })
  }

  function addPrompt() {
    if (!draft) return
    if (!newPrompt.question.trim() && !newPrompt.answer.trim()) return
    const p: Prompt = { id: `p_${Date.now()}`, question: newPrompt.question.trim(), answer: newPrompt.answer.trim() }
    setDraft({ ...draft, prompts: [...draft.prompts, p] })
    setNewPrompt({ question: '', answer: '' })
  }
  function updatePrompt(id: string, patch: Partial<Prompt>) {
    if (!draft) return
    setDraft({
      ...draft,
      prompts: draft.prompts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })
  }
  function removePrompt(id: string) {
    if (!draft) return
    setDraft({ ...draft, prompts: draft.prompts.filter((p) => p.id !== id) })
  }

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: 16, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{basic?.name || 'Your Profile'}</h1>
          <div style={{ opacity: 0.7 }}>{basic?.email}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>Profile completeness: <strong>{completeness}%</strong></div>
          {!editing ? (
            <button onClick={beginEdit} style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={cancelEdit}>Cancel</button>
              <button onClick={saveEdit} style={{ background: '#111827', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Save</button>
            </div>
          )}
        </div>
      </header>

      {/* Basic Info */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Basic information</h2>
        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <Info label="Name" value={basic?.name} />
            <Info label="Email" value={basic?.email} />
            <Info label="Date of birth" value={basic?.dob} />
            <Info label="Location" value={basic?.location} />
            <Info label="Gender" value={prettyGender(basic?.gender)} />
            {completedAt ? <Info label="Profile created" value={new Date(completedAt).toLocaleString()} /> : null}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <Field label="Name"><input value={draft?.basic.name || ''} onChange={(e) => updateBasic('name', e.target.value)} /></Field>
            <Field label="Email"><input value={draft?.basic.email || ''} onChange={(e) => updateBasic('email', e.target.value)} /></Field>
            <Field label="Date of birth"><input type="date" value={draft?.basic.dob || ''} onChange={(e) => updateBasic('dob', e.target.value)} /></Field>
            <Field label="Location"><input value={draft?.basic.location || ''} onChange={(e) => updateBasic('location', e.target.value)} /></Field>
            <Field label="Gender">
              <select value={draft?.basic.gender || 'prefer_not_say'} onChange={(e) => updateGender(e.target.value as Gender)}>
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="nonbinary">Non-binary</option>
                <option value="prefer_not_say">Prefer not to say</option>
              </select>
            </Field>
          </div>
        )}
      </section>

      {/* Photos */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Photos</h2>
          <small style={{ opacity: 0.75 }}>{photos?.length || 0} / 6</small>
        </div>
        {!editing ? (
          photos?.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
              {photos.map((src, idx) => (
                <img key={idx} src={src} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.7, marginTop: 8 }}>No photos yet. You can add them in onboarding later.</p>
          )
        ) : (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {draft?.photos.map((src, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={src} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <button onClick={() => removePhoto(idx)} style={{ position: 'absolute', top: 8, right: 8, background: '#111827', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input placeholder="Paste image URL" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} style={{ flex: 1 }} />
              <button onClick={addPhoto}>Add photo</button>
            </div>
          </div>
        )}
      </section>

      {/* Prompts */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Prompts</h2>
        {!editing ? (
          prompts?.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {prompts.map(p => (
                <li key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.question}</div>
                  <div>{p.answer || <em style={{ opacity: 0.7 }}>No answer</em>}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ opacity: 0.7 }}>No prompts yet. You can add prompts and answers in onboarding later.</p>
          )
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {draft?.prompts.map((p) => (
              <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 6 }}>
                <Field label="Question"><input value={p.question} onChange={(e) => updatePrompt(p.id, { question: e.target.value })} /></Field>
                <Field label="Answer"><textarea rows={2} value={p.answer} onChange={(e) => updatePrompt(p.id, { answer: e.target.value })} /></Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => removePrompt(p.id)}>Remove</button>
                </div>
              </div>
            ))}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 6 }}>
              <Field label="New question"><input value={newPrompt.question} onChange={(e) => setNewPrompt({ ...newPrompt, question: e.target.value })} /></Field>
              <Field label="New answer"><textarea rows={2} value={newPrompt.answer} onChange={(e) => setNewPrompt({ ...newPrompt, answer: e.target.value })} /></Field>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={addPrompt}>Add prompt</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Account & Settings (static for now) */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Info label="Sign-in method" value={data.accountMethod === 'phone' ? 'Phone number' : 'Email'} />
        </div>
        {!editing && <p style={{ opacity: 0.7, marginTop: 12 }}>Editing coming soon.</p>}
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</div>
      <div>{value ? value : <em style={{ opacity: 0.7 }}>—</em>}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  )}

function prettyGender(g?: Gender) {
  if (!g) return '—'
  if (g === 'prefer_not_say') return 'Prefer not to say'
  if (g === 'nonbinary') return 'Non-binary'
  return g.charAt(0).toUpperCase() + g.slice(1)
}