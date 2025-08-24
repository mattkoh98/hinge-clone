import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { MediaService } from '../services/media.service'
import { handleError } from '../lib/errors'

// Request schemas
const uploadUrlSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1)
})

const deletePhotoSchema = z.object({
  publicId: z.string().min(1)
})

export async function mediaRoutes(fastify: FastifyInstance) {
  const mediaService = new MediaService()

  // Upload photo directly
  fastify.post('/upload', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    
    try {
      // Handle multipart file upload
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({ error: 'No file provided' })
      }

      // Validate file type
      if (!mediaService.validateFileType(data.mimetype)) {
        return reply.status(400).send({ 
          error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
        })
      }

      // Convert stream to buffer
      const buffer = await data.toBuffer()

      // Validate file size
      if (!mediaService.validateFileSize(buffer.length)) {
        return reply.status(400).send({ 
          error: 'File too large. Maximum size is 10MB.' 
        })
      }

      const result = await mediaService.uploadPhoto(buffer, data.filename, user.id)
      return result
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Get signed upload URL for client-side upload
  fastify.post('/upload-url', {
    preHandler: [authenticate, validateBody(uploadUrlSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user } = request as any
    const { fileName, fileType } = request.body as any
    
    try {
      // Validate file type
      if (!mediaService.validateFileType(fileType)) {
        return reply.status(400).send({ 
          error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
        })
      }

      const result = await mediaService.getSignedUploadUrl(fileName, user.id)
      return result
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })

  // Delete photo
  fastify.delete('/photo', {
    preHandler: [authenticate, validateBody(deletePhotoSchema)]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { publicId } = request.body as any
    
    try {
      await mediaService.deletePhoto(publicId)
      return { message: 'Photo deleted successfully' }
    } catch (error) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }
  })
}