

// ===================================================================
// ports/ProfilePort.ts — Purpose: Contract for profile read/write ops
// Implemented by localStorage adapter now; HTTP later.
// ===================================================================

import type { ProfileV1, Prompt } from '../domain/profile'

export interface ProfilePort {
  get(): Promise<ProfileV1 | null>
  upsert(patch: Partial<ProfileV1>): Promise<ProfileV1>
  // Photos (MVP: URLs only)
  addPhoto(url: string): Promise<ProfileV1>
  removePhoto(index: number): Promise<ProfileV1>
  // Prompts
  addPrompt(item: Omit<Prompt, 'id'>): Promise<ProfileV1>
  updatePrompt(id: string, patch: Partial<Prompt>): Promise<ProfileV1>
  removePrompt(id: string): Promise<ProfileV1>
}