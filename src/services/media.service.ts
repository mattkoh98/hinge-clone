

// =====================================================================
// services/media.service.ts — Thin wrapper for media operations
// =====================================================================

import { createMediaService } from './factory'

const adapter = createMediaService()

export function validateMediaUrl(url: string) { return adapter.validateUrl(url) }
export function uploadFromUrl(url: string) { return adapter.uploadFromUrl(url) }