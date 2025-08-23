// ================================================
// environment.ts — Environment configuration
// ================================================

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000, // 10 seconds
  },
  
  // Feature Flags
  features: {
    useApi: import.meta.env.VITE_USE_API === 'true',
    enableRealTime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
  },
  
  // Media Configuration
  media: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxPhotos: 6,
  },
  
  // Development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

// Type-safe config access
export type Config = typeof config
