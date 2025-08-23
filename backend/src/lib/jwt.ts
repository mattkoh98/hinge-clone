import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface JWTPayload {
  userId: string
  iat?: number
  exp?: number
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'hinge-clone',
    audience: 'hinge-clone-users'
  })
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'hinge-clone',
      audience: 'hinge-clone-users'
    }) as JWTPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}
