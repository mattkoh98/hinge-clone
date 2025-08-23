import { FastifyRequest, FastifyReply } from 'fastify'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function createRateLimiter(config: RateLimitConfig) {
  return (request: FastifyRequest, reply: FastifyReply) => {
    const key = request.ip || 'unknown'
    const now = Date.now()
    
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs
      }
    } else {
      store[key].count++
    }
    
    if (store[key].count > config.maxRequests) {
      reply.status(429).send({
        error: 'Too many requests',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      })
      return
    }
    
    reply.header('X-RateLimit-Limit', config.maxRequests)
    reply.header('X-RateLimit-Remaining', Math.max(0, config.maxRequests - store[key].count))
    reply.header('X-RateLimit-Reset', store[key].resetTime)
  }
}

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})

export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
})
