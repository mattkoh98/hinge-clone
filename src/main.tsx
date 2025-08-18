import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Swipe from './pages/Swipe'
import Profile from './pages/Profile'
import Conversations from './pages/Conversations'
import Chat from './pages/Chat'

function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthed = !!localStorage.getItem('auth')
  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const isAuthed = !!localStorage.getItem('auth')
  if (isAuthed) {
    return <Navigate to="/swipe" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/swipe" element={<RequireAuth><Swipe /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/conversations" element={<RequireAuth><Conversations /></RequireAuth>} />
      <Route path="/conversations/:id" element={<RequireAuth><Chat /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/swipe" replace />} />
    </Routes>
  )
}
