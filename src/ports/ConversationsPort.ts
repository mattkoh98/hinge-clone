/**
 * ConversationsPort — contract for conversation data access.
 * Adapters (localStorage, HTTP, etc.) implement this interface so
 * the UI/services can switch data sources without refactors.
 */
import type { Conversation, Message } from '../domain/conversation'

export interface ConversationsPort {
  listConversations(): Promise<Conversation[]>
  getConversationById(id: string): Promise<Conversation | null>
  addMessage(conversationId: string, message: Message): Promise<void>
  createConversation(participantIds: string[]): Promise<Conversation>
}
