// ===================================================================
// adapters/http/media.http.ts — HTTP implementation of MediaPort
// Handles media uploads and management via Cloudinary
// ===================================================================

import type { MediaPort } from '../../ports/MediaPort'
import { post, del } from './client'

export class HttpMediaAdapter implements MediaPort {
  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await post<{ url: string }>('/media/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
    
    return response.url
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    await del('/media/delete', { url: photoUrl })
  }

  async getSignedUploadUrl(fileName: string, fileType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
    return await post<{ uploadUrl: string; publicUrl: string }>('/media/signed-url', {
      fileName,
      fileType
    })
  }
}
