/**
 * App.tsx — Application Router & Nav (Single Source of Truth)
 * -----------------------------------------------------------
 * PURPOSE
 * - Owns ALL routing for the app and top navigation.
 * - Applies auth guards: `RequireAuth` for private pages, `PublicOnly` for login/signup.
 * - Seeds demo credentials (MVP) and renders Logout.
 *
 * RESPONSIBILITIES
 * - Define routes for: /signup, /login, /onboarding, /swipe, /conversations, /conversations/:id, /profile
 * - Render nav links conditionally based on `auth` presence in localStorage.
 * - Never contain page-specific UI (keep pages inside /pages/*).
 *
 * INPUTS / SIDE EFFECTS
 * - Reads/writes localStorage: `auth`, `user`, `demo_email`, `demo_password`.
 * - Navigates via react-router.
 *
 * HOW TO EXTEND
 * - Add a new page: create `src/pages/NewPage.tsx`, then add a guarded route here.
 * - Keep this file lean: routing, nav, guards only.
 */

import { Link, NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import type { JSX } from 'react'

// Pages
import Signup from './pages/Signup'
import Login from './pages/Login'
import Loading from './pages/Loading'
import Swipe from './pages/Swipe'
import Conversations from './pages/Conversations'
import Chat from './pages/Chat'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const isAuthed = !!localStorage.getItem('auth')
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const isAuthed = !!localStorage.getItem('auth')
  if (isAuthed) return <Navigate to="/swipe" replace />
  return children
}

export default function App() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()

  // Seed demo credentials (for Login) if missing
  const seedEmail = (localStorage.getItem('demo_email') || '').trim()
  const seedPass  = (localStorage.getItem('demo_password') || '').trim()
  if (!seedEmail) localStorage.setItem('demo_email', 'demo@example.com')
  if (!seedPass)  localStorage.setItem('demo_password', 'demo1234')

  const authed = !!localStorage.getItem('auth')

  return (
    <div>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>HingeClone</Link>
          {authed ? (
            <>
              <NavLink to="/swipe">Swipe</NavLink>
              <NavLink to="/conversations">Conversations</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/onboarding">Onboarding</NavLink>
              <span style={{ opacity: 0.75 }}>Signed in as {user?.name || user?.email || 'user'}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('auth')
                  window.location.href = '/login'
                }}
                style={{ background: '#111827', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
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
          <Route path="/" element={<Navigate to={authed ? '/swipe' : '/login'} replace />} />

          {/* Public-only */}
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />

          {/* Protected */}
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/swipe" element={<RequireAuth><Swipe /></RequireAuth>} />
          <Route path="/conversations" element={<RequireAuth><Conversations /></RequireAuth>} />
          <Route path="/conversations/:id" element={<RequireAuth><Chat /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          <Route path="/loading" element={<Loading />} />
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </main>
    </div>
  )
}
