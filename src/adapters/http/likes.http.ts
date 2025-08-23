// ===================================================================
// adapters/http/likes.http.ts — HTTP implementation of LikesPort
// Handles incoming/outgoing likes and match creation
// ===================================================================

import type { LikesPort } from '../../ports/LikesPort'
import type { IncomingLike, OutgoingLike, LikeContext } from '../../domain/like'
import { get, post, del } from './client'
import { Events, emit } from '../../lib/events'

export class HttpLikesAdapter implements LikesPort {
  async incoming(): Promise<IncomingLike[]> {
    return await get<IncomingLike[]>('/likes/incoming')
  }

  async sent(): Promise<OutgoingLike[]> {
    return await get<OutgoingLike[]>('/likes/sent')
  }

  async send(toUser: { id: string; name?: string }, opts?: { comment?: string; context?: LikeContext }): Promise<OutgoingLike> {
    const response = await post<OutgoingLike>('/likes/send', {
      toUserId: toUser.id,
      comment: opts?.comment,
      context: opts?.context
    })
    
    // Emit event after successful API call
    emit(Events.likesChanged)
    return response
  }

  async removeIncoming(likeId: string): Promise<void> {
    await del(`/likes/incoming/${likeId}`)
    emit(Events.likesChanged)
  }

  async respondToLike(likeId: string, accept: boolean): Promise<void> {
    await post(`/likes/${likeId}/respond`, { accept })
    emit(Events.likesChanged)
  }
}
