// ===================================================================
// adapters/http/auth.http.ts — HTTP implementation of AuthPort
// Uses JWT cookies for session management
// ===================================================================

import type { AuthPort } from '../../ports/AuthPort'
import type { User } from '../../domain/user'
import { http, post, del } from './client'

export class HttpAuthAdapter implements AuthPort {
  async currentUser(): Promise<User | null> {
    try {
      return await http<User>('/auth/me')
    } catch {
      return null
    }
  }

  async login(email: string, password: string): Promise<User> {
    const response = await post<{ user: User; token: string }>('/auth/login', {
      email,
      password
    })
    
    // JWT token is automatically handled by cookies (httpOnly)
    return response.user
  }

  async signup(input: { email: string; password: string; name?: string }): Promise<User> {
    const response = await post<{ user: User; token: string }>('/auth/signup', input)
    return response.user
  }

  async demoLogin(): Promise<User> {
    // For demo purposes, create a demo user on the backend
    return this.signup({
      email: 'demo@example.com',
      password: 'demo1234',
      name: 'Demo User'
    })
  }

  async logout(): Promise<void> {
    await del('/auth/logout')
    // Clear any client-side state if needed
    window.dispatchEvent(new Event('auth-changed'))
  }
}
