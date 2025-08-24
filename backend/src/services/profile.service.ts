import { prisma } from '../lib/prisma'
import { NotFoundError, ValidationError } from '../lib/errors'
import { setCache, getCache, deleteCache } from '../lib/redis'

export interface ProfileBasicInput {
  name: string
  email: string
  dob: Date
  location: string
  gender: 'woman' | 'man' | 'nonbinary' | 'prefer_not_say'
}

export interface PhotoInput {
  url: string
  position?: number
}

export interface PromptInput {
  question: string
  answer: string
}

export class ProfileService {
  async getProfile(userId: string) {
    // Try cache first
    const cacheKey = `profile:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return cached
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: { orderBy: { position: 'asc' } },
        prompts: { orderBy: { createdAt: 'asc' } }
      }
    })

    if (!profile) {
      throw new NotFoundError('Profile not found')
    }

    // Cache for 5 minutes
    await setCache(cacheKey, profile, 300)

    return profile
  }

  async createProfile(userId: string, input: ProfileBasicInput) {
    const profile = await prisma.profile.create({
      data: {
        userId,
        ...input,
        completedAt: new Date()
      },
      include: {
        photos: { orderBy: { position: 'asc' } },
        prompts: { orderBy: { createdAt: 'asc' } }
      }
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)

    return profile
  }

  async updateProfile(userId: string, input: Partial<ProfileBasicInput>) {
    const profile = await prisma.profile.update({
      where: { userId },
      data: input,
      include: {
        photos: { orderBy: { position: 'asc' } },
        prompts: { orderBy: { createdAt: 'asc' } }
      }
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)

    return profile
  }

  async addPhoto(userId: string, input: PhotoInput) {
    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { photos: true }
    })

    if (!profile) {
      throw new NotFoundError('Profile not found')
    }

    // Check photo limit
    if (profile.photos.length >= 6) {
      throw new ValidationError('Maximum 6 photos allowed')
    }

    // Set position if not provided
    const position = input.position ?? profile.photos.length

    const photo = await prisma.photo.create({
      data: {
        profileId: profile.id,
        url: input.url,
        position
      }
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)

    return photo
  }

  async removePhoto(userId: string, photoId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })

    if (!profile) {
      throw new NotFoundError('Profile not found')
    }

    await prisma.photo.delete({
      where: {
        id: photoId,
        profileId: profile.id
      }
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)
  }

  async addPrompt(userId: string, input: PromptInput) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { prompts: true }
    })

    if (!profile) {
      throw new NotFoundError('Profile not found')
    }

    // Check prompt limit
    if (profile.prompts.length >= 3) {
      throw new ValidationError('Maximum 3 prompts allowed')
    }

    const prompt = await prisma.prompt.create({
      data: {
        profileId: profile.id,
        question: input.question,
        answer: input.answer
      }
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)

    return prompt
  }

  async updatePrompt(userId: string, promptId: string, input: PromptInput) {
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })

    if (!profile) {
      throw new NotFoundError('Profile not found')
    }

    const prompt = await prisma.prompt.update({
      where: {
        id: promptId,
        profileId: profile.id
      },
      data: input
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)

    return prompt
  }

  async removePrompt(userId: string, promptId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })

    if (!profile) {
      throw new NotFoundError('Profile not found')
    }

    await prisma.prompt.delete({
      where: {
        id: promptId,
        profileId: profile.id
      }
    })

    // Clear cache
    await deleteCache(`profile:${userId}`)
  }
}
