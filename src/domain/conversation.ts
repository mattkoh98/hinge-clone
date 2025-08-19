/**
 * Domain models for Conversations and Messages.
 * Note: Dates are serialized to JSON in localStorage; adapters must revive them.
 */
export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  participants: string[] // user IDs
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  /**
   * UI optimization: last message preview for lists (optional).
   * Adapters may keep this in sync when adding messages.
   */
  lastMessage?: string
}
