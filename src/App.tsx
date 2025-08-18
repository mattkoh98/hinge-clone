import { Link, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Loading from './pages/Loading'
import Swipe from './pages/Swipe'
import Conversations from './pages/Conversations'

function App() {
  return (
    <div>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>HingeClone</Link>
          <NavLink to="/signup">Sign up</NavLink>
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/swipe">Swipe</NavLink>
          <NavLink to="/conversations">Conversations</NavLink>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Swipe />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/swipe" element={<Swipe />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
