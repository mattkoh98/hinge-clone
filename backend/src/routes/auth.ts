import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { config } from '../config'
import { authenticate } from '../middleware/auth'
import { signToken } from '../lib/jwt'

// Request schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

export async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = loginSchema.parse(request.body)
    
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }

      // Generate JWT token
      const token = signToken({ userId: user.id })

      // Create session
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      await prisma.session.create({
        data: {
          userId: user.id,
          jti: token,
          expiresAt
        }
      })

      // Set HTTP-only cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/'
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Signup
  fastify.post('/signup', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, name } = signupSchema.parse(request.body)
    
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return reply.status(409).send({ error: 'User already exists' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name
        }
      })

      // Generate JWT token
      const token = signToken({ userId: user.id })

      // Create session
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      await prisma.session.create({
        data: {
          userId: user.id,
          jti: token,
          expiresAt
        }
      })

      // Set HTTP-only cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/'
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Get current user
  fastify.get('/me', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })

      return dbUser
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Logout
  fastify.post('/logout', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      // Delete session
      await prisma.session.deleteMany({
        where: { userId: user.id }
      })

      // Clear cookie
      reply.clearCookie('token', { path: '/' })

      return { message: 'Logged out successfully' }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
