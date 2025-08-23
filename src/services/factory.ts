// =============================================================
// services/factory.ts — Purpose: Factory for creating adapters
// Toggles between local and HTTP implementations based on USE_API flag
// =============================================================

import { USE_API } from '../config/featureFlags'

// Local adapters
import { LocalAuthAdapter } from '../adapters/local/auth.local'
import { LocalProfileAdapter } from '../adapters/local/profile.local'
import { LikesLocalAdapter } from '../adapters/local/likes.service'
import { MatchesLocalAdapter } from '../adapters/local/matches.local'
import { LocalConversationsAdapter } from '../adapters/local/conversations.local'
import { LocalMediaAdapter } from '../adapters/local/media.local'

// HTTP adapters
import { HttpAuthAdapter } from '../adapters/http/auth.http'
import { HttpProfileAdapter } from '../adapters/http/profile.http'
import { HttpLikesAdapter } from '../adapters/http/likes.http'
import { HttpMatchesAdapter } from '../adapters/http/matches.http'
import { HttpConversationsAdapter } from '../adapters/http/conversations.http'
import { HttpMediaAdapter } from '../adapters/http/media.http'

// Port interfaces
import type { AuthPort } from '../ports/AuthPort'
import type { ProfilePort } from '../ports/ProfilePort'
import type { LikesPort } from '../ports/LikesPort'
import type { MatchesPort } from '../ports/MatchesPort'
import type { ConversationsPort } from '../ports/ConversationsPort'
import type { MediaPort } from '../ports/MediaPort'

export function createAuthService(): AuthPort {
  return USE_API ? new HttpAuthAdapter() : new LocalAuthAdapter()
}

export function createProfileService(): ProfilePort {
  return USE_API ? new HttpProfileAdapter() : new LocalProfileAdapter()
}

export function createLikesService(): LikesPort {
  return USE_API ? new HttpLikesAdapter() : new LikesLocalAdapter()
}

export function createMatchesService(): MatchesPort {
  return USE_API ? new HttpMatchesAdapter() : new MatchesLocalAdapter()
}

export function createConversationsService(): ConversationsPort {
  return USE_API ? new HttpConversationsAdapter() : new LocalConversationsAdapter()
}

export function createMediaService(): MediaPort {
  return USE_API ? new HttpMediaAdapter() : new LocalMediaAdapter()
}

// Convenience function to check current mode
export function isUsingAPI(): boolean {
  return USE_API
}
