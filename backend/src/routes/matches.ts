import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'

export async function matchesRoutes(fastify: FastifyInstance) {
  // Get user matches
  fastify.get('/', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { userAId: user.id },
            { userBId: user.id }
          ]
        },
        include: {
          userA: { select: { id: true, name: true } },
          userB: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      return matches.map(match => ({
        id: match.id,
        userA: match.userA,
        userB: match.userB,
        createdAt: match.createdAt
      }))
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Get specific match
  fastify.get('/:id', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    
    try {
      const match = await prisma.match.findFirst({
        where: {
          id,
          OR: [
            { userAId: user.id },
            { userBId: user.id }
          ]
        },
        include: {
          userA: { select: { id: true, name: true } },
          userB: { select: { id: true, name: true } }
        }
      })

      if (!match) {
        return reply.status(404).send({ error: 'Match not found' })
      }

      return {
        id: match.id,
        userA: match.userA,
        userB: match.userB,
        createdAt: match.createdAt
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
