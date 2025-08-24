import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateBody, validateParams, validateQuery } from '../middleware/validate'
import { ConversationsService } from '../services/conversations.service'
import { handleError } from '../lib/errors'

// Request schemas
const conversationIdSchema = z.object({
  id: z.string().uuid()
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000)
})

const messageIdSchema = z.object({
  id: z.string().uuid()
})

const messagesQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional()
})

export async function conversationsRoutes(fastify: FastifyInstance) {
  const conversationsService = new ConversationsService()

  // Get all conversations for user
  fastify.get('/', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const conversations = await conversationsService.getConversations(user.id)
      return conversations
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Get specific conversation with messages
  fastify.get('/:id', {
    preHandler: [authenticate, validateParams(conversationIdSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      const conversation = await conversationsService.getConversation(user.id, id)
      return conversation
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Get messages for a conversation (paginated)
  fastify.get('/:id/messages', {
    preHandler: [authenticate, validateParams(conversationIdSchema), validateQuery(messagesQuerySchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    const { limit = 50, offset = 0 } = request.query as any
    
    try {
      const messages = await conversationsService.getMessages(user.id, id, limit, offset)
      return messages
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Send message to conversation
  fastify.post('/:id/messages', {
    preHandler: [authenticate, validateParams(conversationIdSchema), validateBody(sendMessageSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      const message = await conversationsService.sendMessage(user.id, id, request.body as any)
      return message
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Delete message (only sender can delete)
  fastify.delete('/messages/:id', {
    preHandler: [authenticate, validateParams(messageIdSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      await conversationsService.deleteMessage(user.id, id)
      return { message: 'Message deleted successfully' }
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}