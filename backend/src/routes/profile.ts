import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { ProfileService } from '../services/profile.service'
import { handleError } from '../lib/errors'

// Request schemas
const profileBasicSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  dob: z.string().transform((val) => new Date(val)), // Convert ISO string to Date
  location: z.string().min(1),
  gender: z.enum(['woman', 'man', 'nonbinary', 'prefer_not_say'])
})

const profileUpdateSchema = profileBasicSchema.partial()
const photoSchema = z.object({
  url: z.string().url(),
  position: z.number().optional()
})
const promptSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1)
})

export async function profileRoutes(fastify: FastifyInstance) {
  const profileService = new ProfileService()

  // Get current profile
  fastify.get('/me', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const profile = await profileService.getProfile(user.id)
      return profile
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Create profile
  fastify.post('/', {
    preHandler: [authenticate, validateBody(profileBasicSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const profile = await profileService.createProfile(user.id, request.body as any)
      return profile
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Update profile
  fastify.put('/', {
    preHandler: [authenticate, validateBody(profileUpdateSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const profile = await profileService.updateProfile(user.id, request.body as any)
      return profile
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Add photo to profile
  fastify.post('/photo', {
    preHandler: [authenticate, validateBody(photoSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const photo = await profileService.addPhoto(user.id, request.body as any)
      return photo
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Add prompt to profile
  fastify.post('/prompt', {
    preHandler: [authenticate, validateBody(promptSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const prompt = await profileService.addPrompt(user.id, request.body as any)
      return prompt
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}
