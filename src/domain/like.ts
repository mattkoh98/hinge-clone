

// =============================================================
// domain/like.ts — Purpose: Core types for Likes (incoming/sent)
// These domain types are UI-agnostic and storage-agnostic.
// =============================================================

export type LikeContext = {
  photoIndex?: number
  promptId?: string
}

export interface IncomingLike {
  id: string
  at: Date
  fromUser: { id: string; name: string }
  comment?: string
  context?: LikeContext
}

export interface OutgoingLike {
  id: string
  at: Date
  toUser: { id: string; name: string }
  comment?: string
  context?: LikeContext
}