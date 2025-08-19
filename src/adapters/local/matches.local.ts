

// ====================================================================================
// adapters/local/matches.local.ts — Purpose: LocalStorage implementation of
// MatchesPort. Accepts likes, creates a match, and appends a conversation in the
// legacy shape expected by your current Conversations page.
// ====================================================================================

import type { MatchesPort } from '../../ports/MatchesPort'
import type { Match } from '../../domain/match'
import type { IncomingLike } from '../../domain/like'
import { Events, emit } from '../../lib/events'

const INCOMING_KEY = 'incoming_likes'
const MATCHES_KEY = 'matches'
const CONVERSATIONS_KEY = 'conversations'

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function loadIncoming(): any[] {
  try { const raw = localStorage.getItem(INCOMING_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveIncoming(x: any[]) { try { localStorage.setItem(INCOMING_KEY, JSON.stringify(x)) } catch {} }

function loadMatches(): Match[] {
  try { const raw = localStorage.getItem(MATCHES_KEY); return raw ? JSON.parse(raw).map(reviveMatch) : [] } catch { return [] }
}
function saveMatches(x: Match[]) { try { localStorage.setItem(MATCHES_KEY, JSON.stringify(x)) } catch {} }

function loadConversations(): any[] {
  try { const raw = localStorage.getItem(CONVERSATIONS_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveConversations(x: any[]) { try { localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(x)) } catch {} }

function reviveMatch(m: any): Match {
  return {
    id: String(m.id),
    userA: String(m.userA),
    userB: String(m.userB),
    createdAt: new Date(m.createdAt),
    conversationId: m.conversationId ? String(m.conversationId) : undefined,
  }
}

function getCurrentUserId(): string {
  try { const u = JSON.parse(localStorage.getItem('user') || 'null'); return String(u?.id || u?.email || 'me') } catch { return 'me' }
}

export class MatchesLocalAdapter implements MatchesPort {
  async list(): Promise<Match[]> { return loadMatches() }

  async accept(likeId: string): Promise<{ match: Match; conversationId: string }> {
    // 1) remove from incoming likes (support legacy shapes)
    const incoming: any[] = loadIncoming()
    const idx = incoming.findIndex((x) => String(x?.id) === String(likeId))
    const item: any = idx >= 0 ? incoming[idx] : null
    if (idx >= 0) { incoming.splice(idx, 1); saveIncoming(incoming); emit(Events.likesChanged) }

    // derive other user id/name
    const otherId   = item?.fromUser?.id ?? item?.fromProfile?.id ?? `u_${likeId}`
    const otherName = item?.fromUser?.name ?? item?.fromProfile?.name ?? 'Someone'

    // 2) append a conversation (legacy shape used by Conversations.tsx)
    const convos = loadConversations()
    const nextId = (convos.at(-1)?.id ?? 0) + 1
    const conversationId = String(nextId)
    convos.push({
      id: nextId,
      partner: { id: Number(otherId) || nextId, name: String(otherName) },
      lastMessage: 'Matched! Start the convo ✨',
      updatedAt: Date.now(),
    })
    saveConversations(convos)

    // 3) create and store match
    const matches = loadMatches()
    const match: Match = {
      id: genId('match'),
      userA: getCurrentUserId(),
      userB: String(otherId),
      createdAt: new Date(),
      conversationId,
    }
    matches.push(match)
    saveMatches(matches)

    return { match, conversationId }
  }
}