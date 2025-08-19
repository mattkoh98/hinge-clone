

// =============================================================
// domain/profile.ts — Purpose: Core profile types used by the UI
// and adapters (storage or HTTP). Contains no browser-specific code.
// =============================================================

export type Gender = 'woman' | 'man' | 'nonbinary' | 'prefer_not_say'

export type Prompt = { id: string; question: string; answer: string }

export interface ProfileBasic {
  name: string
  email: string
  dob: string // ISO date (YYYY-MM-DD)
  location: string
  gender: Gender
}

export interface ProfileV1 {
  accountMethod: 'email' | 'phone'
  basic: ProfileBasic
  photos: string[] // urls (MVP)
  prompts: Prompt[]
  completedAt?: Date
}