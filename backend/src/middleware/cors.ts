import { FastifyRequest, FastifyReply } from 'fastify'
import { config } from '../config'

export function corsMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const origin = request.headers.origin
  
  // Allow requests from configured client URL
  if (origin === config.clientUrl) {
    reply.header('Access-Control-Allow-Origin', origin)
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    reply.header('Access-Control-Max-Age', '86400') // 24 hours
    reply.send()
    return
  }
  
  // Set CORS headers for all responses
  reply.header('Access-Control-Allow-Credentials', 'true')
}
