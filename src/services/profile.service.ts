

// =====================================================================
// services/profile.service.ts — Thin wrapper around the active adapter
// Pages import from here; later we can swap to HTTP adapter behind the scenes.
// =====================================================================

import { LocalProfileAdapter } from '../adapters/local/profile.local'
import type { ProfileV1, Prompt } from '../domain/profile'

const adapter = new LocalProfileAdapter()

export function getProfile(): Promise<ProfileV1 | null> { return adapter.get() }
export function saveProfile(patch: Partial<ProfileV1>): Promise<ProfileV1> { return adapter.upsert(patch) }
export function addPhoto(url: string) { return adapter.addPhoto(url) }
export function removePhoto(index: number) { return adapter.removePhoto(index) }
export function addPrompt(item: Omit<Prompt, 'id'>) { return adapter.addPrompt(item) }
export function updatePrompt(id: string, patch: Partial<Prompt>) { return adapter.updatePrompt(id, patch) }
export function removePrompt(id: string) { return adapter.removePrompt(id) }