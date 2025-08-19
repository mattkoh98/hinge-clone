

// ====================================================================================
// adapters/local/likes.service.ts — Purpose: LocalStorage implementation of LikesPort
// Normalizes legacy shapes and persists in a stable domain format.
// ====================================================================================

import type { LikesPort } from '../../ports/LikesPort'
import type { IncomingLike, OutgoingLike, LikeContext } from '../../domain/like'
import { Events, emit } from '../../lib/events'

const INCOMING_KEY = 'incoming_likes'
const OUTGOING_KEY = 'outgoing_likes'

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function reviveIncoming(x: any, i: number): IncomingLike {
  // Accept legacy shapes like {at, fromProfile:{id,name}, comment, context}
  const at = x?.at ? new Date(x.at) : new Date()
  const fromUser = x?.fromUser
    ? { id: String(x.fromUser.id), name: String(x.fromUser.name || 'Someone') }
    : x?.fromProfile
      ? { id: String(x.fromProfile.id ?? 10000 + i), name: String(x.fromProfile.name || 'Someone') }
      : { id: String(x?.id ?? 10000 + i), name: String(x?.name || 'Someone') }
  const id = String(x?.id || genId('like'))
  const context = x?.context && typeof x.context === 'object' ? x.context as LikeContext : undefined
  const comment = typeof x?.comment === 'string' ? x.comment : undefined
  return { id, at, fromUser, comment, context }
}

function reviveOutgoing(x: any, i: number): OutgoingLike {
  const at = x?.at ? new Date(x.at) : new Date()
  const toUser = x?.toUser
    ? { id: String(x.toUser.id), name: String(x.toUser.name || `User ${i}`) }
    : { id: String(x?.toProfileId ?? 20000 + i), name: String(x?.toName || `User ${i}`) }
  const id = String(x?.id || genId('sent'))
  const context = x?.context && typeof x.context === 'object' ? x.context as LikeContext : undefined
  const comment = typeof x?.comment === 'string' ? x.comment : undefined
  return { id, at, toUser, comment, context }
}

function loadIncoming(): IncomingLike[] {
  try {
    const raw = localStorage.getItem(INCOMING_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map(reviveIncoming)
  } catch { return [] }
}

function loadSent(): OutgoingLike[] {
  try {
    const raw = localStorage.getItem(OUTGOING_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map(reviveOutgoing)
  } catch { return [] }
}

function saveIncoming(items: IncomingLike[]) {
  try { localStorage.setItem(INCOMING_KEY, JSON.stringify(items)) } catch {}
}
function saveSent(items: OutgoingLike[]) {
  try { localStorage.setItem(OUTGOING_KEY, JSON.stringify(items)) } catch {}
}

export class LikesLocalAdapter implements LikesPort {
  async incoming(): Promise<IncomingLike[]> { return loadIncoming() }
  async sent(): Promise<OutgoingLike[]> { return loadSent() }

  async send(toUser: { id: string; name?: string }, opts?: { comment?: string; context?: LikeContext }): Promise<OutgoingLike> {
    const list = loadSent()
    const item: OutgoingLike = {
      id: genId('sent'),
      at: new Date(),
      toUser: { id: String(toUser.id), name: String(toUser.name || `User ${toUser.id}`) },
      comment: opts?.comment,
      context: opts?.context,
    }
    list.push(item)
    saveSent(list)
    emit(Events.likesChanged)
    return item
  }

  async removeIncoming(likeId: string): Promise<void> {
    const list = loadIncoming()
    const next = list.filter(l => l.id !== likeId)
    saveIncoming(next)
    emit(Events.likesChanged)
  }
}