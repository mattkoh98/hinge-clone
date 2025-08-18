import { Link, NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Loading from './pages/Loading'
import Swipe from './pages/Swipe'
import Conversations from './pages/Conversations'
import type { JSX } from 'react'

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const isAuthed = !!localStorage.getItem('auth')
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function App() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()
  // Seed demo credentials on first load (so Login works out of the box)
  const seedEmail = (localStorage.getItem('demo_email') || '').trim()
  const seedPass  = (localStorage.getItem('demo_password') || '').trim()
  if (!seedEmail) localStorage.setItem('demo_email', 'demo@example.com')
  if (!seedPass)  localStorage.setItem('demo_password', 'demo1234')
  return (
    <div>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>HingeClone</Link>
          {localStorage.getItem('auth') ? (
            <>
              <NavLink to="/swipe">Swipe</NavLink>
              <NavLink to="/conversations">Conversations</NavLink>
              <span style={{ opacity: 0.75 }}>Signed in as {user?.name || user?.email || 'user'}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('auth')
                  window.location.href = '/login'
                }}
                style={{
                  background: '#111827', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signup">Sign up</NavLink>
              <NavLink to="/login">Log in</NavLink>
            </>
          )}
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to={localStorage.getItem('auth') ? '/swipe' : '/login'} replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/swipe" element={<RequireAuth><Swipe /></RequireAuth>} />
          <Route path="/conversations" element={<RequireAuth><Conversations /></RequireAuth>} />
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
