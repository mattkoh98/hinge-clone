

// ===================================================================
// ports/AuthPort.ts — Purpose: Contract for auth operations
// Local adapter uses localStorage; later swap to Auth.js/HTTP.
// ===================================================================

import type { User } from '../domain/user'

export interface AuthPort {
  currentUser(): Promise<User | null>
  login(email: string, password: string): Promise<User>
  signup(input: { email: string; password: string; name?: string }): Promise<User>
  demoLogin(): Promise<User>
  logout(): Promise<void>
}