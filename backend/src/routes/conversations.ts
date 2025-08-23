import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../index'
import { authenticate } from '../middleware/auth'

export async function conversationsRoutes(fastify: FastifyInstance) {
  // Get user conversations
  fastify.get('/', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId: user.id }
          }
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true } }
            }
          },
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return conversations.map(conv => ({
        id: conv.id,
        participants: conv.participants.map(p => p.user),
        lastMessage: conv.messages[0]?.content,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }))
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Get specific conversation
  fastify.get('/:id', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          participants: {
            some: { userId: user.id }
          }
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true } }
            }
          },
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' })
      }

      return {
        id: conversation.id,
        participants: conversation.participants.map(p => p.user),
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Send message
  fastify.post('/:id/messages', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    const { content } = request.body as any
    
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          content
        }
      })

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() }
      })

      return message
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
