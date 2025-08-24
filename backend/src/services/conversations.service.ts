import { prisma } from '../lib/prisma'
import { NotFoundError, ValidationError } from '../lib/errors'
import { setCache, getCache, deleteCache } from '../lib/redis'

export interface SendMessageInput {
  content: string
}

export class ConversationsService {
  async getConversations(userId: string) {
    const cacheKey = `conversations:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return cached
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        match: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      },
      include: {
        match: {
          include: {
            userA: { select: { id: true, name: true } },
            userB: { select: { id: true, name: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = conversations.map(conv => ({
      id: conv.id,
      participants: [conv.match.userA, conv.match.userB],
      lastMessage: conv.messages[0]?.text,
      createdAt: conv.createdAt
    }))

    // Cache for 1 minute
    await setCache(cacheKey, result, 60)

    return result
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        match: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      },
      include: {
        match: {
          include: {
            userA: { select: { id: true, name: true } },
            userB: { select: { id: true, name: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true } }
          }
        }
      }
    })

    if (!conversation) {
      throw new NotFoundError('Conversation not found')
    }

    return {
      id: conversation.id,
      participants: [conversation.match.userA, conversation.match.userB],
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        content: msg.text,
        senderId: msg.authorId,
        sender: msg.sender,
        timestamp: msg.createdAt
      })),
      createdAt: conversation.createdAt
    }
  }

  async sendMessage(userId: string, conversationId: string, input: SendMessageInput) {
    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        match: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      },
      include: {
        match: true
      }
    })

    if (!conversation) {
      throw new NotFoundError('Conversation not found')
    }

    // Validate message content
    if (!input.content || input.content.trim().length === 0) {
      throw new ValidationError('Message content cannot be empty')
    }

    if (input.content.length > 1000) {
      throw new ValidationError('Message content too long (max 1000 characters)')
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        authorId: userId,
        text: input.content.trim(),
        kind: 'TEXT'
      },
      include: {
        sender: { select: { id: true, name: true } }
      }
    })

    // Clear conversation caches
    await deleteCache(`conversations:${conversation.match.userAId}`)
    await deleteCache(`conversations:${conversation.match.userBId}`)

    return {
      id: message.id,
      content: message.text,
      senderId: message.authorId,
      sender: message.sender,
      timestamp: message.createdAt
    }
  }

  async getMessages(userId: string, conversationId: string, limit: number = 50, offset: number = 0) {
    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        match: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      }
    })

    if (!conversation) {
      throw new NotFoundError('Conversation not found')
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return messages.map(msg => ({
      id: msg.id,
      content: msg.text,
      senderId: msg.authorId,
      sender: msg.sender,
      timestamp: msg.createdAt
    })).reverse() // Return in chronological order
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        authorId: userId
      },
      include: {
        conversation: {
          include: {
            match: true
          }
        }
      }
    })

    if (!message) {
      throw new NotFoundError('Message not found')
    }

    await prisma.message.delete({
      where: { id: messageId }
    })

    // Clear conversation caches
    const match = message.conversation.match
    await deleteCache(`conversations:${match.userAId}`)
    await deleteCache(`conversations:${match.userBId}`)
  }
}
