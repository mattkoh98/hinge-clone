import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodError } from 'zod'
import { ValidationError } from '../lib/errors'

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.body)
      request.body = validated
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new ValidationError(message)
      }
      throw error
    }
  }
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.params)
      request.params = validated
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new ValidationError(message)
      }
      throw error
    }
  }
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.query)
      request.query = validated
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new ValidationError(message)
      }
      throw error
    }
  }
}
