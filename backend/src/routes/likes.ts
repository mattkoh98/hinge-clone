import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../index'
import { authenticate } from '../middleware/auth'

export async function likesRoutes(fastify: FastifyInstance) {
  // Get incoming likes
  fastify.get('/incoming', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const likes = await prisma.incomingLike.findMany({
        where: { toUserId: user.id },
        include: {
          fromUser: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return likes.map(like => ({
        id: like.id,
        at: like.createdAt,
        fromUser: like.fromUser,
        comment: like.comment,
        context: {
          photoIndex: like.photoIndex,
          promptId: like.promptId
        }
      }))
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Get sent likes
  fastify.get('/sent', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const likes = await prisma.outgoingLike.findMany({
        where: { fromUserId: user.id },
        include: {
          toUser: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return likes.map(like => ({
        id: like.id,
        at: like.createdAt,
        toUser: like.toUser,
        comment: like.comment,
        context: {
          photoIndex: like.photoIndex,
          promptId: like.promptId
        }
      }))
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Send like
  fastify.post('/send', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { toUserId, comment, context } = request.body as any
    
    try {
      const like = await prisma.outgoingLike.create({
        data: {
          fromUserId: user.id,
          toUserId,
          comment,
          photoIndex: context?.photoIndex,
          promptId: context?.promptId
        }
      })

      return like
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
