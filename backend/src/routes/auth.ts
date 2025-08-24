import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { config } from '../config'
import { authenticate } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { AuthService } from '../services/auth.service'
import { handleError } from '../lib/errors'

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
  const authService = new AuthService()

  // Login
  fastify.post('/login', {
    preHandler: validateBody(loginSchema)
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await authService.login(request.body as any)
      
      // Set HTTP-only cookie
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
      
      reply.setCookie('token', result.token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/'
      })

      return { user: result.user }
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Signup
  fastify.post('/signup', {
    preHandler: validateBody(signupSchema)
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await authService.signup(request.body as any)
      
      // Set HTTP-only cookie
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
      
      reply.setCookie('token', result.token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/'
      })

      return { user: result.user }
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Get current user
  fastify.get('/me', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const dbUser = await authService.getCurrentUser(user.id)
      return dbUser
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Logout
  fastify.post('/logout', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      await authService.logout(user.id)
      
      // Clear cookie
      reply.clearCookie('token', { path: '/' })

      return { message: 'Logged out successfully' }
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}
