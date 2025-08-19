

// =============================================================
// domain/media.ts — Purpose: Media asset types (photos/videos)
// =============================================================

export type MediaKind = 'photo' | 'video'

export interface MediaAsset {
  url: string
  kind: MediaKind
  order?: number
}