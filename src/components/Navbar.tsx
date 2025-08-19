// components/Navbar.tsx
// Purpose: Top nav with public vs authed links + live Likes badge.

import { NavLink, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getIncomingLikes } from '../services/likes.service'

export default function Navbar() {
  const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem('auth'))
  const [userLabel, setUserLabel] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      return u?.name || u?.email || 'user'
    } catch { return 'user' }
  })
  const [likesCount, setLikesCount] = useState<number>(0)

  useEffect(() => {
    async function readLikes() {
      try {
        const items = await getIncomingLikes()
        setLikesCount(Array.isArray(items) ? items.length : 0)
      } catch { setLikesCount(0) }
    }
    function readAuth() {
      setAuthed(!!localStorage.getItem('auth'))
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        setUserLabel(u?.name || u?.email || 'user')
      } catch { setUserLabel('user') }
    }

    readAuth()
    readLikes()

    // cross-tab/local updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'incoming_likes') readLikes()
      if (e.key === 'auth' || e.key === 'user') readAuth()
    }
    window.addEventListener('storage', onStorage)

    // custom events our adapters fire
    const onAuthChanged = () => readAuth()
    const onLikesChanged = () => readLikes()
    window.addEventListener('auth-changed', onAuthChanged as EventListener)
    window.addEventListener('likes-changed', onLikesChanged as EventListener)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('auth-changed', onAuthChanged as EventListener)
      window.removeEventListener('likes-changed', onLikesChanged as EventListener)
    }
  }, [])

  return (
    <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '8px 12px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>
          HingeClone
        </Link>

        {authed ? (
          <>
            <NavLink to="/swipe">Swipe</NavLink>
            <NavLink to="/conversations">Conversations</NavLink>
            <NavLink to="/likes">Likes{likesCount ? ` (${likesCount})` : ''}</NavLink>
            <NavLink to="/likes-sent">Likes Sent</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <span style={{ opacity: 0.75 }}>Signed in as {userLabel}</span>
            <button
              onClick={() => {
                localStorage.removeItem('auth')
                window.dispatchEvent(new Event('auth-changed'))
                window.location.href = '/login'
              }}
              style={{
                background: '#111827',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
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
  )
}