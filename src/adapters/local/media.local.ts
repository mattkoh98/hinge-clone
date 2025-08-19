

// =====================================================================================
// adapters/local/media.local.ts — Local media adapter (URL validation only)
// In real backend, this would sign and upload to Cloudinary/S3.
// =====================================================================================

import type { MediaPort } from '../../ports/MediaPort'

function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

export class LocalMediaAdapter implements MediaPort {
  async validateUrl(url: string): Promise<boolean> {
    return isValidUrl(url)
  }
  async uploadFromUrl(url: string): Promise<{ url: string }> {
    if (!isValidUrl(url)) throw new Error('Invalid URL')
    // no-op upload (MVP): return the same URL
    return { url }
  }
}