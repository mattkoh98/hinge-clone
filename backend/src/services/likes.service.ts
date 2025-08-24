import { prisma } from '../lib/prisma'
import { NotFoundError, ValidationError } from '../lib/errors'
import { setCache, getCache, deleteCache } from '../lib/redis'

export interface SendLikeInput {
  toUserId: string
  comment?: string
  context?: any // JSON context (photo index, prompt ID, etc.)
}

export class LikesService {
  async getIncomingLikes(userId: string) {
    const cacheKey = `incoming_likes:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return cached
    }

    const likes = await prisma.like.findMany({
      where: {
        toUserId: userId,
        status: 'PENDING'
      },
      include: {
        fromUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = likes.map(like => ({
      id: like.id,
      at: like.createdAt,
      fromUser: like.fromUser,
      comment: like.comment,
      context: like.context
    }))

    // Cache for 1 minute
    await setCache(cacheKey, result, 60)

    return result
  }

  async getSentLikes(userId: string) {
    const cacheKey = `sent_likes:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return cached
    }

    const likes = await prisma.like.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = likes.map(like => ({
      id: like.id,
      at: like.createdAt,
      toUser: like.toUser,
      comment: like.comment,
      context: like.context,
      status: like.status
    }))

    // Cache for 1 minute
    await setCache(cacheKey, result, 60)

    return result
  }

  async sendLike(fromUserId: string, input: SendLikeInput) {
    // Check if user is trying to like themselves
    if (fromUserId === input.toUserId) {
      throw new ValidationError('Cannot like yourself')
    }

    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        fromUserId,
        toUserId: input.toUserId
      }
    })

    if (existingLike) {
      throw new ValidationError('Like already sent')
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: input.toUserId },
      select: { id: true, name: true }
    })

    if (!targetUser) {
      throw new NotFoundError('User not found')
    }

    const like = await prisma.like.create({
      data: {
        fromUserId,
        toUserId: input.toUserId,
        comment: input.comment,
        context: input.context,
        status: 'PENDING'
      }
    })

    // Clear caches
    await deleteCache(`incoming_likes:${input.toUserId}`)
    await deleteCache(`sent_likes:${fromUserId}`)

    return like
  }

  async respondToLike(userId: string, likeId: string, accept: boolean) {
    const like = await prisma.like.findFirst({
      where: {
        id: likeId,
        toUserId: userId,
        status: 'PENDING'
      }
    })

    if (!like) {
      throw new NotFoundError('Like not found')
    }

    if (accept) {
      // Update like status to accepted
      await prisma.like.update({
        where: { id: likeId },
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

      // Clear caches
      await deleteCache(`incoming_likes:${userId}`)
      await deleteCache(`sent_likes:${like.fromUserId}`)
      await deleteCache(`matches:${userId}`)
      await deleteCache(`matches:${like.fromUserId}`)

      return { match, conversation }
    } else {
      // Update like status to skipped
      await prisma.like.update({
        where: { id: likeId },
        data: { status: 'SKIPPED' }
      })

      // Clear cache
      await deleteCache(`incoming_likes:${userId}`)

      return { message: 'Like skipped' }
    }
  }

  async removeLike(userId: string, likeId: string) {
    const like = await prisma.like.findFirst({
      where: {
        id: likeId,
        toUserId: userId,
        status: 'PENDING'
      }
    })

    if (!like) {
      throw new NotFoundError('Like not found')
    }

    await prisma.like.delete({
      where: { id: likeId }
    })

    // Clear cache
    await deleteCache(`incoming_likes:${userId}`)
  }
}
