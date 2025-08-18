import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  const nameNorm = (name || '').trim()
  const emailNorm = (email || '').trim().toLowerCase()
  const passNorm  = (password || '').trim()
  if (!nameNorm || !emailNorm || !passNorm) {
    // Basic guard; keep minimal UI changes
    alert('Please fill out name, email, and password')
    return
  }

  // Save a very simple “account” locally (MVP)
  localStorage.setItem('auth', '1')
  try { localStorage.setItem('user', JSON.stringify({ name: nameNorm, email: emailNorm })) } catch {}

  // Persist as demo credentials so Login works consistently
  localStorage.setItem('demo_email', emailNorm)
  localStorage.setItem('demo_password', passNorm)

  // Navigate into the app
  navigate('/swipe', { replace: true })
}

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button type="submit">Create account</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

