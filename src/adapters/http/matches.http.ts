// ===================================================================
// adapters/http/matches.http.ts — HTTP implementation of MatchesPort
// Handles match creation and management
// ===================================================================

import type { MatchesPort } from '../../ports/MatchesPort'
import type { Match } from '../../domain/match'
import { get, post } from './client'

export class HttpMatchesAdapter implements MatchesPort {
  async getMatches(): Promise<Match[]> {
    return await get<Match[]>('/matches')
  }

  async getMatch(matchId: string): Promise<Match | null> {
    try {
      return await get<Match>(`/matches/${matchId}`)
    } catch {
      return null
    }
  }

  async createMatch(userId: string): Promise<Match> {
    return await post<Match>('/matches', { userId })
  }

  async getMatchByUsers(userA: string, userB: string): Promise<Match | null> {
    try {
      return await get<Match>(`/matches/by-users?userA=${userA}&userB=${userB}`)
    } catch {
      return null
    }
  }
}
