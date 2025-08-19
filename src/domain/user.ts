

// =============================================================
// domain/user.ts — Purpose: Minimal user identity used across the app
// =============================================================

export interface User {
  id: string // stable id (email or generated)
  email: string
  name?: string
}