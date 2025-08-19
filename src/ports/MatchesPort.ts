

// =====================================================================
// ports/MatchesPort.ts — Purpose: Contract for Match operations
// Accept likes (create match + conversation), list matches, etc.
// =====================================================================

import type { Match } from '../domain/match'

export interface MatchesPort {
  list(): Promise<Match[]>
  accept(likeId: string): Promise<{ match: Match; conversationId: string }>
}