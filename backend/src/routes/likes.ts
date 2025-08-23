import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'

export async function likesRoutes(fastify: FastifyInstance) {
  // Get incoming likes
  fastify.get('/incoming', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const likes = await prisma.like.findMany({
        where: { 
          toUserId: user.id,
          status: 'PENDING'
        },
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
        context: like.context
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
      const likes = await prisma.like.findMany({
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
        context: like.context
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
      const like = await prisma.like.create({
        data: {
          fromUserId: user.id,
          toUserId,
          comment,
          context,
          status: 'PENDING'
        }
      })

      return like
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Respond to like (accept/reject)
  fastify.post('/:id/respond', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { id } = request.params as any
    const { accept } = request.body as any
    
    try {
      const like = await prisma.like.findFirst({
        where: {
          id,
          toUserId: user.id,
          status: 'PENDING'
        }
      })

      if (!like) {
        return reply.status(404).send({ error: 'Like not found' })
      }

      if (accept) {
        // Update like status to accepted
        await prisma.like.update({
          where: { id },
          data: { status: 'ACCEPTED' }
        })

        // Create match
        const match = await prisma.match.create({
          data: {
            userAId: like.fromUserId,
            userBId: like.toUserId,
            likeId: like.id
          }
        })

        // Create conversation
        const conversation = await prisma.conversation.create({
          data: {
            matchId: match.id
          }
        })

        return { match, conversation }
      } else {
        // Update like status to skipped
        await prisma.like.update({
          where: { id },
          data: { status: 'SKIPPED' }
        })

        return { message: 'Like skipped' }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
