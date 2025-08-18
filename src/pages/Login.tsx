// ================================================
// Login.tsx
// Purpose: Allows user to log in with email/password
// or demo credentials. Redirects authenticated users
// to the Swipe screen.
// ================================================
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inputEmail = (email || '').trim().toLowerCase()
    const inputPass  = (password || '').trim()

    const savedEmail = (localStorage.getItem('demo_email') || '').trim().toLowerCase()
    const savedPass  = (localStorage.getItem('demo_password') || '').trim()

    const defaultEmail = 'demo@example.com'
    const defaultPass  = 'demo1234'

    const matchesSaved   = !!savedEmail && !!savedPass && inputEmail === savedEmail && inputPass === savedPass
    const matchesDefault = inputEmail === defaultEmail && inputPass === defaultPass

    if (matchesSaved || matchesDefault) {
      localStorage.setItem('auth', '1')
      const existingName = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.name } catch { return null } })()
      localStorage.setItem('user', JSON.stringify({ name: existingName || 'Demo User', email: inputEmail || defaultEmail }))
      const from = (location.state as any)?.from?.pathname || '/swipe'
      navigate(from, { replace: true })
    } else {
      setErr('Invalid email or password (try demo@example.com / demo1234)')
    }
  }

  function demoLogin() {
    const defaultEmail = 'demo@example.com'
    const defaultPass  = 'demo1234'
    localStorage.setItem('demo_email', defaultEmail)
    localStorage.setItem('demo_password', defaultPass)
    localStorage.setItem('auth', '1')
    localStorage.setItem('user', JSON.stringify({ name: 'Demo User', email: defaultEmail }))
    const from = (location.state as any)?.from?.pathname || '/swipe'
    navigate(from, { replace: true })
  }

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>Email
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="demo@example.com" required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="demo1234" required />
        </label>
        {err && <div style={{ color: 'crimson' }}>{err}</div>}
        <button type="submit">Log in</button>
      </form>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={demoLogin} style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
          Log in with demo account
        </button>
        <Link to="/signup">Create an account</Link>
      </div>

      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Demo creds: <code>demo@example.com / demo1234</code>
      </p>
    </div>
  )
}