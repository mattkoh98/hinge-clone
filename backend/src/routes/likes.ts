import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateBody, validateParams } from '../middleware/validate'
import { LikesService } from '../services/likes.service'
import { handleError } from '../lib/errors'

// Request schemas
const sendLikeSchema = z.object({
  toUserId: z.string().uuid(),
  comment: z.string().optional(),
  context: z.any().optional()
})

const respondToLikeSchema = z.object({
  accept: z.boolean()
})

const likeIdSchema = z.object({
  id: z.string().uuid()
})

export async function likesRoutes(fastify: FastifyInstance) {
  const likesService = new LikesService()

  // Get incoming likes
  fastify.get('/incoming', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const likes = await likesService.getIncomingLikes(user.id)
      return likes
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Get sent likes
  fastify.get('/sent', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const likes = await likesService.getSentLikes(user.id)
      return likes
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Send like
  fastify.post('/send', {
    preHandler: [authenticate, validateBody(sendLikeSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const like = await likesService.sendLike(user.id, request.body as any)
      return like
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Respond to like (accept/reject)
  fastify.post('/:id/respond', {
    preHandler: [authenticate, validateParams(likeIdSchema), validateBody(respondToLikeSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    const { accept } = request.body as any
    
    try {
      const result = await likesService.respondToLike(user.id, id, accept)
      return result
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}