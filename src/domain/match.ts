

// =============================================================
// domain/match.ts — Purpose: Core types for Matches
// A match forms from two users and may create a conversation.
// =============================================================

export interface Match {
  id: string
  userA: string
  userB: string
  createdAt: Date
  conversationId?: string
}