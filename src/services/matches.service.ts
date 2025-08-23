

// =====================================================================
// services/matches.service.ts — Purpose: Thin wrapper for MatchesPort
// Accept likes and retrieve matches (local now; HTTP later).
// =====================================================================

import type { Match } from '../domain/match'
import { createMatchesService } from './factory'

const adapter = createMatchesService()

export function listMatches(): Promise<Match[]> {
  return adapter.list()
}
export function acceptLike(likeId: string) {
  return adapter.accept(likeId)
}