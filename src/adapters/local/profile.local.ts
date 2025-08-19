

// =====================================================================================
// adapters/local/profile.local.ts — LocalStorage implementation of ProfilePort
// Persists under key `profile_v1` and revives Date fields on read.
// =====================================================================================

import type { ProfilePort } from '../../ports/ProfilePort'
import type { ProfileV1, Prompt } from '../../domain/profile'

const KEY = 'profile_v1'

function revive(p: any): ProfileV1 | null {
  if (!p) return null
  return {
    accountMethod: (p.accountMethod === 'phone' ? 'phone' : 'email'),
    basic: {
      name: String(p?.basic?.name || ''),
      email: String(p?.basic?.email || ''),
      dob: String(p?.basic?.dob || ''),
      location: String(p?.basic?.location || ''),
      gender: (p?.basic?.gender || 'prefer_not_say') as any,
    },
    photos: Array.isArray(p?.photos) ? p.photos.map(String) : [],
    prompts: Array.isArray(p?.prompts) ? p.prompts.map((q: any) => ({ id: String(q.id), question: String(q.question||''), answer: String(q.answer||'') })) : [],
    completedAt: p?.completedAt ? new Date(p.completedAt) : undefined,
  }
}

function load(): ProfileV1 | null {
  try { const raw = localStorage.getItem(KEY); return raw ? revive(JSON.parse(raw)) : null } catch { return null }
}
function save(p: ProfileV1) { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {} }

export class LocalProfileAdapter implements ProfilePort {
  async get(): Promise<ProfileV1 | null> { return load() }

  async upsert(patch: Partial<ProfileV1>): Promise<ProfileV1> {
    const current = load() || {
      accountMethod: 'email',
      basic: { name: '', email: '', dob: '', location: '', gender: 'prefer_not_say' as const },
      photos: [],
      prompts: [],
    }
    const next: ProfileV1 = revive({ ...current, ...patch }) as ProfileV1
    // mark first-complete timestamp if not set
    if (!next.completedAt) next.completedAt = new Date()
    save(next)
    return next
  }

  async addPhoto(url: string): Promise<ProfileV1> {
    const p = load() || await this.upsert({})
    const next: ProfileV1 = { ...p!, photos: [...(p!.photos||[]), String(url)] }
    save(next)
    return revive(next)! as ProfileV1
  }

  async removePhoto(index: number): Promise<ProfileV1> {
    const p = load() || await this.upsert({})
    const copy = [...(p!.photos||[])]
    if (index >= 0 && index < copy.length) copy.splice(index, 1)
    const next: ProfileV1 = { ...p!, photos: copy }
    save(next)
    return revive(next)! as ProfileV1
  }

  async addPrompt(item: Omit<Prompt, 'id'>): Promise<ProfileV1> {
    const p = load() || await this.upsert({})
    const newItem: Prompt = { id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`, question: item.question, answer: item.answer }
    const next: ProfileV1 = { ...p!, prompts: [...(p!.prompts||[]), newItem] }
    save(next)
    return revive(next)! as ProfileV1
  }

  async updatePrompt(id: string, patch: Partial<Prompt>): Promise<ProfileV1> {
    const p = load() || await this.upsert({})
    const nextPrompts = (p!.prompts||[]).map(q => q.id === id ? { ...q, ...patch, id: q.id } : q)
    const next: ProfileV1 = { ...p!, prompts: nextPrompts }
    save(next)
    return revive(next)! as ProfileV1
  }

  async removePrompt(id: string): Promise<ProfileV1> {
    const p = load() || await this.upsert({})
    const next: ProfileV1 = { ...p!, prompts: (p!.prompts||[]).filter(q => q.id !== id) }
    save(next)
    return revive(next)! as ProfileV1
  }
}