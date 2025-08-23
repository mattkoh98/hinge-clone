import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { config } from './config'
import { env } from './env'
import { prisma } from './lib/prisma'
import { authRateLimit, apiRateLimit } from './lib/ratelimit'
import { corsMiddleware } from './middleware/cors'
import { authRoutes } from './routes/auth'
import { profileRoutes } from './routes/profile'
import { likesRoutes } from './routes/likes'
import { matchesRoutes } from './routes/matches'
import { conversationsRoutes } from './routes/conversations'
import { mediaRoutes } from './routes/media'

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: config.isDevelopment ? 'info' : 'warn',
    transport: config.isDevelopment
      ? { target: 'pino-pretty' }
      : undefined
  }
})

// Register plugins
await fastify.register(cookie, {
  secret: config.jwt.secret
})

await fastify.register(multipart, {
  limits: {
    fileSize: config.media.maxFileSize,
    files: 1
  }
})

// Add custom middleware
fastify.addHook('preHandler', corsMiddleware)
fastify.addHook('preHandler', apiRateLimit)

// Add auth rate limiting to auth routes
fastify.addHook('preHandler', (request, reply, done) => {
  if (request.url.startsWith('/auth')) {
    authRateLimit(request, reply)
  }
  done()
})

// Register routes
await fastify.register(authRoutes, { prefix: '/auth' })
await fastify.register(profileRoutes, { prefix: '/profile' })
await fastify.register(likesRoutes, { prefix: '/likes' })
await fastify.register(matchesRoutes, { prefix: '/matches' })
await fastify.register(conversationsRoutes, { prefix: '/conversations' })
await fastify.register(mediaRoutes, { prefix: '/media' })

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close()
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await fastify.close()
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
try {
  await fastify.listen({ 
    port: env.PORT, 
    host: '0.0.0.0' 
  })
  console.log(`🚀 Server running on port ${env.PORT}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
