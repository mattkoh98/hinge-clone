

// ==================================================================
// ports/LikesPort.ts — Purpose: Contract for Like data access methods
// Adapters implement this (localStorage now, HTTP later).
// ==================================================================

import type { IncomingLike, OutgoingLike, LikeContext } from '../domain/like'

export interface LikesPort {
  incoming(): Promise<IncomingLike[]>
  sent(): Promise<OutgoingLike[]>
  send(toUser: { id: string; name?: string }, opts?: { comment?: string; context?: LikeContext }): Promise<OutgoingLike>
  removeIncoming(likeId: string): Promise<void>
}