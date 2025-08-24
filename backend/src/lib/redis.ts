import { createClient } from 'redis'
import { config } from '../config'

export type RedisClient = ReturnType<typeof createClient>

let client: RedisClient | null = null

export async function getRedisClient(): Promise<RedisClient> {
  if (!client) {
    client = createClient({
      url: config.redis.url
    })

    client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    client.on('connect', () => {
      console.log('✅ Connected to Redis')
    })

    await client.connect()
  }

  return client
}

export async function setSession(sessionId: string, data: any, ttlSeconds: number = 604800): Promise<void> {
  const redis = await getRedisClient()
  await redis.setEx(`session:${sessionId}`, ttlSeconds, JSON.stringify(data))
}

export async function getSession(sessionId: string): Promise<any | null> {
  const redis = await getRedisClient()
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data) : null
}

export async function deleteSession(sessionId: string): Promise<void> {
  const redis = await getRedisClient()
  await redis.del(`session:${sessionId}`)
}

export async function setCache(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
  const redis = await getRedisClient()
  await redis.setEx(`cache:${key}`, ttlSeconds, JSON.stringify(data))
}

export async function getCache(key: string): Promise<any | null> {
  const redis = await getRedisClient()
  const data = await redis.get(`cache:${key}`)
  return data ? JSON.parse(data) : null
}

export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClient()
  await redis.del(`cache:${key}`)
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit()
    client = null
  }
}
