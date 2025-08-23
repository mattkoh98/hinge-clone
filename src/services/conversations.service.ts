// src/services/conversations.service.ts
/**
 * Conversations Service — thin wrapper around the active adapter.
 * Pages should import from here (not from adapters) so we can swap
 * local → http later without touching UI.
 */
import { createConversationsService } from './factory'
import type { Message } from '../domain/conversation'

// Factory automatically toggles between local and HTTP adapters
const adapter = createConversationsService()

export function getConversations() {
  return adapter.listConversations()
}

export function getConversation(id: string) {
  return adapter.getConversationById(id)
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const msg: Message = {
    id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    conversationId,
    senderId,
    content,
    timestamp: new Date(),
  }
  await adapter.addMessage(conversationId, msg)
  return msg
}

export function startConversation(participantIds: string[]) {
  return adapter.createConversation(participantIds)
}

/**
 * Convenience: just return the messages of a conversation.
 */
export async function getMessages(conversationId: string) {
  const conv = await adapter.getConversationById(conversationId)
  return conv?.messages ?? []
}