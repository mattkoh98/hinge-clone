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
          match: {
            OR: [
              { userAId: user.id },
              { userBId: user.id }
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

      return conversations.map(conv => ({
        id: conv.id,
        participants: [conv.match.userA, conv.match.userB],
        lastMessage: conv.messages[0]?.text,
        createdAt: conv.createdAt
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
          match: {
            OR: [
              { userAId: user.id },
              { userBId: user.id }
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
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' })
      }

      return {
        id: conversation.id,
        participants: [conversation.match.userA, conversation.match.userB],
        messages: conversation.messages,
        createdAt: conversation.createdAt
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
          authorId: user.id,
          text: content,
          kind: 'TEXT'
        }
      })

      return message
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
