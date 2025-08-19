

// =====================================================================================
// adapters/local/auth.local.ts — LocalStorage implementation of AuthPort
// Keys: 'auth' (truthy string), 'user' (User JSON), 'demo_email', 'demo_password'.
// Dispatches a window 'auth-changed' event on state changes (navbar reacts).
// =====================================================================================

import type { AuthPort } from '../../ports/AuthPort'
import type { User } from '../../domain/user'

function dispatchAuthChanged() {
  try { window.dispatchEvent(new Event('auth-changed')) } catch {}
}

function seedDemoCreds() {
  const e = (localStorage.getItem('demo_email') || '').trim()
  const p = (localStorage.getItem('demo_password') || '').trim()
  if (!e) localStorage.setItem('demo_email', 'demo@example.com')
  if (!p) localStorage.setItem('demo_password', 'demo1234')
}

export class LocalAuthAdapter implements AuthPort {
  async currentUser(): Promise<User | null> {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }

  async login(email: string, password: string): Promise<User> {
    seedDemoCreds()
    const demoEmail = localStorage.getItem('demo_email') || 'demo@example.com'
    const demoPass  = localStorage.getItem('demo_password') || 'demo1234'

    // For MVP: accept demo creds or any non-empty pair; adjust as needed
    if (!email || !password) throw new Error('Missing credentials')
    if (email !== demoEmail || password !== demoPass) {
      // allow any credentials -> create a user (optional: tighten this check)
      // throw new Error('Invalid credentials')
    }

    const user: User = { id: email, email, name: email.split('@')[0] }
    localStorage.setItem('auth', '1')
    localStorage.setItem('user', JSON.stringify(user))
    dispatchAuthChanged()
    return user
  }

  async signup(input: { email: string; password: string; name?: string }): Promise<User> {
    if (!input.email || !input.password) throw new Error('Missing fields')
    const user: User = { id: input.email, email: input.email, name: input.name || input.email.split('@')[0] }
    localStorage.setItem('auth', '1')
    localStorage.setItem('user', JSON.stringify(user))
    dispatchAuthChanged()
    return user
  }

  async demoLogin(): Promise<User> {
    seedDemoCreds()
    const email = localStorage.getItem('demo_email') || 'demo@example.com'
    const password = localStorage.getItem('demo_password') || 'demo1234'
    return this.login(email, password)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth')
    dispatchAuthChanged()
  }
}