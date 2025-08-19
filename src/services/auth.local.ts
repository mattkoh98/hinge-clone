

// =====================================================================
// services/auth.local.ts — Service wrapper over LocalAuthAdapter
// (Filename kept as provided; acts as the public surface for pages.)
// =====================================================================

import { LocalAuthAdapter } from '../adapters/local/auth.local'
import type { User } from '../domain/user'

const adapter = new LocalAuthAdapter()

export function currentUser() { return adapter.currentUser() }
export function login(email: string, password: string) { return adapter.login(email, password) }
export function signup(input: { email: string; password: string; name?: string }) { return adapter.signup(input) }
export function demoLogin() { return adapter.demoLogin() }
export function logout() { return adapter.logout() }