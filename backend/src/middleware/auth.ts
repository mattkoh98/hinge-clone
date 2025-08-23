import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { prisma } from '../index'

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string
    email: string
    name?: string
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies.token || request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return reply.status(401).send({ error: 'Authentication required' })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    
    // Check if session exists in database
    const session = await prisma.session.findFirst({
      where: {
        jti: token,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return reply.status(401).send({ error: 'Invalid or expired session' })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return reply.status(401).send({ error: 'User not found' })
    }

    // Attach user to request
    ;(request as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' })
  }
}

export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies.token || request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return // Continue without authentication
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    
    const session = await prisma.session.findFirst({
      where: {
        jti: token,
        expiresAt: { gt: new Date() }
      }
    })

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, email: true, name: true }
      })

      if (user) {
        ;(request as AuthenticatedRequest).user = {
          id: user.id,
          email: user.email,
          name: user.name || undefined
        }
      }
    }
  } catch (error) {
    // Continue without authentication on error
  }
}
