// ================================================
// Profile.tsx — Purpose: Displays and allows editing of the user's own profile,
// including photos, prompts, and settings.
// ================================================

import { useEffect, useMemo, useState } from 'react'

type Gender = 'woman' | 'man' | 'nonbinary' | 'prefer_not_say'

type ProfileV1 = {
  accountMethod: 'email' | 'phone'
  basic: { name: string; email: string; dob: string; location: string; gender: Gender }
  photos: string[]
  prompts: { id: string; question: string; answer: string }[]
  completedAt?: number
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileV1 | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('profile_v1')
    if (raw) {
      try { setProfile(JSON.parse(raw) as ProfileV1) } catch { setProfile(null) }
    } else {
      // fallback: hydrate from signup `user` if profile hasn't been created yet
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        if (u) {
          setProfile({
            accountMethod: 'email',
            basic: { name: u.name || '', email: u.email || '', dob: '', location: '', gender: 'prefer_not_say' },
            photos: [],
            prompts: [],
          })
        }
      } catch { /* noop */ }
    }
  }, [])

  const completeness = useMemo(() => {
    if (!profile) return 0
    let score = 0
    const { basic, photos, prompts } = profile
    if (basic?.name) score += 1
    if (basic?.email) score += 1
    if (basic?.dob) score += 1
    if (basic?.location) score += 1
    if (basic?.gender) score += 1
    if (photos?.length) score += 1
    if (prompts?.length) score += 1
    return Math.round((score / 7) * 100)
  }, [profile])

  if (!profile) {
    return (
      <div style={{ maxWidth: 720, margin: '32px auto', padding: 16 }}>
        <h1>My Profile</h1>
        <p style={{ opacity: 0.8 }}>No profile found yet. Complete onboarding to set up your profile.</p>
      </div>
    )
  }

  const { basic, photos, prompts, completedAt } = profile

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: 16, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{basic?.name || 'Your Profile'}</h1>
          <div style={{ opacity: 0.7 }}>{basic?.email}</div>
        </div>
        <div style={{ fontSize: 14, opacity: 0.75 }}>Profile completeness: <strong>{completeness}%</strong></div>
      </header>

      {/* Basic Info */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Basic information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Info label="Name" value={basic?.name} />
          <Info label="Email" value={basic?.email} />
          <Info label="Date of birth" value={basic?.dob} />
          <Info label="Location" value={basic?.location} />
          <Info label="Gender" value={prettyGender(basic?.gender)} />
          {completedAt ? <Info label="Profile created" value={new Date(completedAt).toLocaleString()} /> : null}
        </div>
      </section>

      {/* Photos */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Photos</h2>
          <small style={{ opacity: 0.75 }}>{photos?.length || 0} / 6</small>
        </div>
        {photos?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
            {photos.map((src, idx) => (
              <img key={idx} src={src} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            ))}
          </div>
        ) : (
          <p style={{ opacity: 0.7, marginTop: 8 }}>No photos yet. You can add them in onboarding later.</p>
        )}
      </section>

      {/* Prompts */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Prompts</h2>
        {prompts?.length ? (
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
        )}
      </section>

      {/* Account & Settings (static for now) */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Info label="Sign-in method" value={profile.accountMethod === 'phone' ? 'Phone number' : 'Email'} />
        </div>
        <p style={{ opacity: 0.7, marginTop: 12 }}>Editing coming soon.</p>
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

function prettyGender(g?: Gender) {
  if (!g) return '—'
  if (g === 'prefer_not_say') return 'Prefer not to say'
  if (g === 'nonbinary') return 'Non-binary'
  return g.charAt(0).toUpperCase() + g.slice(1)
}