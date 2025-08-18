/**
 * Signup.tsx — MVP Local Signup (No Backend)
 * -----------------------------------------
 * PURPOSE
 * - Creates a local demo account and redirects to onboarding.
 *
 * RESPONSIBILITIES
 * - Capture name, email, password; normalize inputs.
 * - Persist to localStorage: `auth`, `user`, `demo_email`, `demo_password`.
 * - `navigate('/onboarding')` on success.
 *
 * NOTES
 * - Do not add routing logic here.
 * - When backend is ready, replace localStorage writes with API calls.
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nameNorm = name.trim()
    const emailNorm = email.trim().toLowerCase()
    const passNorm = password.trim()
    if (!nameNorm || !emailNorm || !passNorm) return

    // MVP local account + redirect to onboarding
    localStorage.setItem('auth', '1')
    try { localStorage.setItem('user', JSON.stringify({ name: nameNorm, email: emailNorm })) } catch {}
    localStorage.setItem('demo_email', emailNorm)
    localStorage.setItem('demo_password', passNorm)

    navigate('/onboarding', { replace: true })
  }

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Create your account</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>Name
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" required />
        </label>
        <label>Email
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required />
        </label>
        <button type="submit">Continue</button>
      </form>
      <p style={{ marginTop: 12 }}>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  )
}
