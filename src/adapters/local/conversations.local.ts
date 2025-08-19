/**
 * LocalConversationsAdapter
 * Implements ConversationsPort using browser localStorage.
 * Responsible for serialization/deserialization (including Date revival).
 */
import type { ConversationsPort } from '../../ports/ConversationsPort'
import type { Conversation, Message } from '../../domain/conversation'

const STORAGE_KEY = 'conversations'
const threadKey = (id: string) => `thread_${id}`

function genId(prefix = 'c'): string {
  const rnd = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${rnd}`
}

function reviveConversation(raw: any): Conversation {
  return {
    id: String(raw.id),
    participants: Array.isArray(raw.participants) ? raw.participants.map(String) : [],
    messages: Array.isArray(raw.messages)
      ? raw.messages.map((m: any) => ({
          id: String(m.id),
          conversationId: String(m.conversationId),
          senderId: String(m.senderId),
          content: String(m.content),
          timestamp: new Date(m.timestamp),
        }))
      : [],
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export class LocalConversationsAdapter implements ConversationsPort {
  private loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      const parsed = JSON.parse(data)
      if (!Array.isArray(parsed)) return []
      return parsed.map(reviveConversation)
    } catch {
      return []
    }
  }

  private saveConversations(conversations: Conversation[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)) } catch {}
  }

  async listConversations(): Promise<Conversation[]> {
    return this.loadConversations()
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const conversations = this.loadConversations()
    return conversations.find(c => c.id === id) || null
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const conversations = this.loadConversations()
    const idx = conversations.findIndex(c => c.id === conversationId)
    if (idx === -1) return
    conversations[idx].messages.push(message)
    conversations[idx].lastMessage = message.content.startsWith('You:') ? message.content : `You: ${message.content}`
    conversations[idx].updatedAt = new Date(message.timestamp)
    this.saveConversations(conversations)
    // also persist a flat thread copy if legacy callers read it
    try { localStorage.setItem(threadKey(conversationId), JSON.stringify(conversations[idx].messages)) } catch {}
  }

  async createConversation(participantIds: string[]): Promise<Conversation> {
    const conversations = this.loadConversations()
    const id = genId('conv')
    const now = new Date()
    const conv: Conversation = {
      id,
      participants: participantIds,
      messages: [],
      createdAt: now,
      updatedAt: now,
      lastMessage: '',
    } as any // lastMessage is used by UI; domain keeps messages authoritative
    conversations.push(conv)
    this.saveConversations(conversations)
    return conv
  }
}
