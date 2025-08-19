

// ===================================================================
// ports/MediaPort.ts — Purpose: Contract for media operations
// Local adapter only validates URLs; HTTP later will sign & upload.
// ===================================================================

export interface MediaPort {
  validateUrl(url: string): Promise<boolean>
  // In a real backend, this would return signed params or a target URL
  // For MVP local, we just echo the URL back.
  uploadFromUrl(url: string): Promise<{ url: string }>
}