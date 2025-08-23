// =====================================================================
// services/likes.service.ts — Thin wrapper over the Likes adapter
// Uses the localStorage adapter for now; later we can swap to HTTP.
// =====================================================================

import type { LikeContext, IncomingLike, OutgoingLike } from '../domain/like'
import { createLikesService } from './factory'

const adapter = createLikesService()

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