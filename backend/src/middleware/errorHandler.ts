import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify'
import { ZodError } from 'zod'
import { handleError } from '../lib/errors'

export function setupErrorHandler(fastify: FastifyInstance) {
  // Global error handler
  fastify.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Log the error
    fastify.log.error({
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      params: request.params,
      query: request.query,
      body: request.body
    }, 'Request error')

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.validation
      })
    }

    // Handle custom application errors
    if (error.name && ['AuthenticationError', 'ValidationError', 'NotFoundError', 'ConflictError'].includes(error.name)) {
      const { message, statusCode } = handleError(error)
      return reply.status(statusCode).send({ error: message })
    }

    // Handle Prisma errors
    if (error.code && error.code.startsWith('P')) {
      switch (error.code) {
        case 'P2002':
          return reply.status(409).send({ error: 'Resource already exists' })
        case 'P2025':
          return reply.status(404).send({ error: 'Resource not found' })
        case 'P2003':
          return reply.status(400).send({ error: 'Invalid reference' })
        default:
          fastify.log.error({ prismaError: error }, 'Prisma error')
          return reply.status(500).send({ error: 'Database error' })
      }
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    if (error.name === 'TokenExpiredError') {
      return reply.status(401).send({ error: 'Token expired' })
    }

    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({ 
        error: 'Too many requests',
        retryAfter: error.headers?.['retry-after']
      })
    }

    // Default error response
    const statusCode = error.statusCode || 500
    const message = statusCode === 500 ? 'Internal server error' : error.message

    return reply.status(statusCode).send({ error: message })
  })

  // Handle 404 errors
  fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      error: 'Route not found',
      path: request.url,
      method: request.method
    })
  })
}
