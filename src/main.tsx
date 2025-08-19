/**
 * main.tsx — Vite Bootstrap Entry
 * --------------------------------
 * PURPOSE
 * - Mounts <App/> inside <BrowserRouter/>.
 * - No routes, no guards, no app logic here.
 *
 * HOW TO EXTEND
 * - Keep this file minimal; add providers (theme, query client) if needed.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/App.css'
import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)