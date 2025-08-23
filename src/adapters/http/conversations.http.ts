// ===================================================================
// adapters/http/conversations.http.ts — HTTP implementation of ConversationsPort
// Handles chat conversations and messages
// ===================================================================

import type { ConversationsPort } from '../../ports/ConversationsPort'
import type { Conversation, Message } from '../../domain/conversation'
import { get, post } from './client'

export class HttpConversationsAdapter implements ConversationsPort {
  async getConversations(): Promise<Conversation[]> {
    return await get<Conversation[]>('/conversations')
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      return await get<Conversation>(`/conversations/${conversationId}`)
    } catch {
      return null
    }
  }

  async createConversation(participantIds: string[]): Promise<Conversation> {
    return await post<Conversation>('/conversations', { participantIds })
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return await post<Message>(`/conversations/${conversationId}/messages`, { content })
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await get<Message[]>(`/conversations/${conversationId}/messages`)
  }
}
