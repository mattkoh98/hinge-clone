

// =====================================================================
// services/likes.service.ts — Purpose: Thin wrapper exposing Likes APIs
// Selects the active adapter (local now; HTTP later via a flag).
// =====================================================================

import type { LikeContext, IncomingLike, OutgoingLike } from '../domain/like'
import { LikesLocalAdapter } from '../adapters/local/likes.service'

const adapter = new LikesLocalAdapter()

export function getIncomingLikes(): Promise<IncomingLike[]> {
  return adapter.incoming()
}
export function getSentLikes(): Promise<OutgoingLike[]> {
  return adapter.sent()
}
export function sendLike(toUser: { id: string; name?: string }, opts?: { comment?: string; context?: LikeContext }) {
  return adapter.send(toUser, opts)
}
export function removeIncomingLike(likeId: string) {
  return adapter.removeIncoming(likeId)
}