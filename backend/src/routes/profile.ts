import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../index'
import { authenticate } from '../middleware/auth'

// Request schemas
const profileBasicSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  dob: z.string().transform((val) => new Date(val)), // Convert ISO string to Date
  location: z.string().min(1),
  gender: z.enum(['woman', 'man', 'nonbinary', 'prefer_not_say'])
})

const profileUpdateSchema = profileBasicSchema.partial()

export async function profileRoutes(fastify: FastifyInstance) {
  // Get current profile
  fastify.get('/me', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        include: {
          photos: { orderBy: { order: 'asc' } },
          prompts: { orderBy: { order: 'asc' } }
        }
      })

      if (!profile) {
        return reply.status(404).send({ error: 'Profile not found' })
      }

      return profile
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Create/update profile
  fastify.post('/', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const profileData = profileBasicSchema.parse(request.body)
    
    try {
      const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          ...profileData,
          completedAt: new Date()
        },
        create: {
          userId: user.id,
          ...profileData,
          completedAt: new Date()
        }
      })

      return profile
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Update profile
  fastify.put('/', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const profileData = profileUpdateSchema.parse(request.body)
    
    try {
      const profile = await prisma.profile.update({
        where: { userId: user.id },
        data: profileData
      })

      return profile
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Add photo to profile
  fastify.post('/photo', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { url } = request.body as any
    
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
      })

      if (!profile) {
        return reply.status(404).send({ error: 'Profile not found' })
      }

      const photo = await prisma.photo.create({
        data: {
          profileId: profile.id,
          url,
          position: 0 // Will be updated by frontend
        }
      })

      return photo
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  // Add prompt to profile
  fastify.post('/prompt', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { question, answer } = request.body as any
    
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
      })

      if (!profile) {
        return reply.status(404).send({ error: 'Profile not found' })
      }

      const prompt = await prisma.prompt.create({
        data: {
          profileId: profile.id,
          question,
          answer
        }
      })

      return prompt
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
