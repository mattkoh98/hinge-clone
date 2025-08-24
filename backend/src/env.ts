import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Client
  CLIENT_URL: z.string().url().default('http://localhost:5174')
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.'))
      console.error('❌ Missing or invalid environment variables:')
      missingVars.forEach(variable => console.error(`   - ${variable}`))
      console.error('\nPlease check your .env file and ensure all required variables are set.')
      process.exit(1)
    }
    throw error
  }
}

export const env = validateEnv()
