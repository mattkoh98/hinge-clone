import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { setCache, getCache, deleteCache } from '../lib/redis'

export class MatchesService {
  async getMatches(userId: string) {
    const cacheKey = `matches:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return cached
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
        conversation: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = matches.map(match => ({
      id: match.id,
      userA: match.userA,
      userB: match.userB,
      createdAt: match.createdAt,
      conversationId: match.conversation?.id
    }))

    // Cache for 5 minutes
    await setCache(cacheKey, result, 300)

    return result
  }

  async getMatch(userId: string, matchId: string) {
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
        conversation: {
          select: { id: true }
        }
      }
    })

    if (!match) {
      throw new NotFoundError('Match not found')
    }

    return {
      id: match.id,
      userA: match.userA,
      userB: match.userB,
      createdAt: match.createdAt,
      conversationId: match.conversation?.id
    }
  }

  async getMatchByUsers(userAId: string, userBId: string) {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId }
        ]
      },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
        conversation: {
          select: { id: true }
        }
      }
    })

    if (!match) {
      return null
    }

    return {
      id: match.id,
      userA: match.userA,
      userB: match.userB,
      createdAt: match.createdAt,
      conversationId: match.conversation?.id
    }
  }

  async deleteMatch(userId: string, matchId: string) {
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      }
    })

    if (!match) {
      throw new NotFoundError('Match not found')
    }

    // Delete associated conversation and messages
    await prisma.conversation.deleteMany({
      where: { matchId }
    })

    // Delete the match
    await prisma.match.delete({
      where: { id: matchId }
    })

    // Clear caches
    await deleteCache(`matches:${match.userAId}`)
    await deleteCache(`matches:${match.userBId}`)
    await deleteCache(`conversations:${match.userAId}`)
    await deleteCache(`conversations:${match.userBId}`)
  }
}
