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
        token,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: true
      }
    })

    if (!session) {
      return reply.status(401).send({ error: 'Invalid or expired session' })
    }

    // Attach user to request
    ;(request as AuthenticatedRequest).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined
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
        token,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: true
      }
    })

    if (session) {
      ;(request as AuthenticatedRequest).user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined
      }
    }
  } catch (error) {
    // Continue without authentication on error
  }
}
