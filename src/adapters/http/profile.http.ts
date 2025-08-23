// ===================================================================
// adapters/http/profile.http.ts — HTTP implementation of ProfilePort
// Handles profile CRUD operations and media uploads
// ===================================================================

import type { ProfilePort } from '../../ports/ProfilePort'
import type { ProfileV1, ProfileBasic } from '../../domain/profile'
import { http, get, post, put } from './client'

export class HttpProfileAdapter implements ProfilePort {
  async getCurrentProfile(): Promise<ProfileV1 | null> {
    try {
      return await get<ProfileV1>('/profile/me')
    } catch {
      return null
    }
  }

  async createProfile(input: ProfileBasic): Promise<ProfileV1> {
    return await post<ProfileV1>('/profile', input)
  }

  async updateProfile(input: Partial<ProfileV1>): Promise<ProfileV1> {
    return await put<ProfileV1>('/profile', input)
  }

  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await http<{ url: string }>('/profile/photo', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
    
    return response.url
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    await http('/profile/photo', {
      method: 'DELETE',
      body: { url: photoUrl }
    })
  }

  async addPrompt(question: string, answer: string): Promise<ProfileV1> {
    return await post<ProfileV1>('/profile/prompts', { question, answer })
  }

  async updatePrompt(promptId: string, question: string, answer: string): Promise<ProfileV1> {
    return await put<ProfileV1>(`/profile/prompts/${promptId}`, { question, answer })
  }

  async deletePrompt(promptId: string): Promise<ProfileV1> {
    return await http<ProfileV1>(`/profile/prompts/${promptId}`, { method: 'DELETE' })
  }
}
