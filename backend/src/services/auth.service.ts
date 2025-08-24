import { prisma } from '../lib/prisma'
import { signToken, verifyToken } from '../lib/jwt'
import { hashPassword, comparePassword, validatePasswordStrength } from '../lib/bcrypt'
import { setSession, deleteSession } from '../lib/redis'
import { AuthenticationError, ConflictError, ValidationError } from '../lib/errors'

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput {
  email: string
  password: string
  name?: string
}

export interface AuthResult {
  user: {
    id: string
    email: string
    name: string | null
  }
  token: string
}

export class AuthService {
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new AuthenticationError('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash)
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials')
    }

    // Generate JWT token
    const token = signToken({ userId: user.id })

    // Create session in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        jti: token,
        expiresAt
      }
    })

    // Store session in Redis (optional, for faster lookups)
    try {
      await setSession(token, { userId: user.id }, 604800) // 7 days
    } catch (error) {
      console.warn('Redis session storage failed:', error)
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  }

  async signup(input: SignupInput): Promise<AuthResult> {
    const { email, password, name } = input

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '))
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new ConflictError('User already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name
      }
    })

    // Generate JWT token
    const token = signToken({ userId: user.id })

    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        jti: token,
        expiresAt
      }
    })

    // Store session in Redis
    try {
      await setSession(token, { userId: user.id }, 604800) // 7 days
    } catch (error) {
      console.warn('Redis session storage failed:', error)
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    return user
  }

  async logout(userId: string): Promise<void> {
    // Delete all sessions for user
    const sessions = await prisma.session.findMany({
      where: { userId }
    })

    // Delete from Redis
    for (const session of sessions) {
      try {
        await deleteSession(session.jti)
      } catch (error) {
        console.warn('Redis session deletion failed:', error)
      }
    }

    // Delete from database
    await prisma.session.deleteMany({
      where: { userId }
    })
  }

  async validateSession(token: string) {
    try {
      // Verify JWT
      const decoded = verifyToken(token)

      // Check if session exists in database
      const session = await prisma.session.findFirst({
        where: {
          jti: token,
          expiresAt: { gt: new Date() }
        }
      })

      if (!session) {
        throw new AuthenticationError('Invalid or expired session')
      }

      return { userId: decoded.userId }
    } catch (error) {
      throw new AuthenticationError('Invalid token')
    }
  }
}
