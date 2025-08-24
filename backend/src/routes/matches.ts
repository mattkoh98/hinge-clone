import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateParams } from '../middleware/validate'
import { MatchesService } from '../services/matches.service'
import { handleError } from '../lib/errors'

// Request schemas
const matchIdSchema = z.object({
  id: z.string().uuid()
})

export async function matchesRoutes(fastify: FastifyInstance) {
  const matchesService = new MatchesService()

  // Get all matches for user
  fastify.get('/', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const matches = await matchesService.getMatches(user.id)
      return matches
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Get specific match
  fastify.get('/:id', {
    preHandler: [authenticate, validateParams(matchIdSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      const match = await matchesService.getMatch(user.id, id)
      return match
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Delete match (unmatch)
  fastify.delete('/:id', {
    preHandler: [authenticate, validateParams(matchIdSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      await matchesService.deleteMatch(user.id, id)
      return { message: 'Match deleted successfully' }
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}