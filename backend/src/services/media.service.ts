import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config'
import { ValidationError } from '../lib/errors'

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export class MediaService {
  async uploadPhoto(buffer: Buffer, fileName: string, userId: string): Promise<UploadResult> {
    // Validate file size (10MB limit)
    if (buffer.length > config.media.maxFileSize) {
      throw new ValidationError('File size too large (max 10MB)')
    }

    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `hinge-clone/users/${userId}`,
            public_id: `${Date.now()}-${fileName}`,
            resource_type: 'image',
            transformation: [
              { width: 800, height: 1200, crop: 'limit' },
              { quality: 'auto:good' },
              { format: 'webp' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new ValidationError('Failed to upload image')
    }
  }

  async deletePhoto(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      throw new ValidationError('Failed to delete image')
    }
  }

  async getSignedUploadUrl(fileName: string, userId: string): Promise<{ uploadUrl: string; publicId: string }> {
    const publicId = `hinge-clone/users/${userId}/${Date.now()}-${fileName}`
    
    try {
      const signature = cloudinary.utils.api_sign_request(
        {
          public_id: publicId,
          timestamp: Math.round(Date.now() / 1000),
          transformation: 'w_800,h_1200,c_limit,q_auto:good,f_webp'
        },
        config.cloudinary.apiSecret
      )

      const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`

      return {
        uploadUrl,
        publicId
      }
    } catch (error) {
      console.error('Cloudinary signed URL error:', error)
      throw new ValidationError('Failed to generate upload URL')
    }
  }

  validateFileType(mimeType: string): boolean {
    return config.media.allowedTypes.includes(mimeType)
  }

  validateFileSize(size: number): boolean {
    return size <= config.media.maxFileSize
  }
}
