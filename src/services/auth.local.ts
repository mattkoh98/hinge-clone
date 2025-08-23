

// =====================================================================
// services/auth.service.ts — Service wrapper over auth adapters
// (Filename kept as provided; acts as the public surface for pages.)
// =====================================================================

import { createAuthService } from './factory'
import type { User } from '../domain/user'

const adapter = createAuthService()

export function currentUser() { return adapter.currentUser() }
export function login(email: string, password: string) { return adapter.login(email, password) }
export function signup(input: { email: string; password: string; name?: string }) { return adapter.signup(input) }
export function demoLogin() { return adapter.demoLogin() }
export function logout() { return adapter.logout() }