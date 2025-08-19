

// =====================================================================
// services/media.service.ts — Thin wrapper for media operations
// =====================================================================

import { LocalMediaAdapter } from '../adapters/local/media.local'

const adapter = new LocalMediaAdapter()

export function validateMediaUrl(url: string) { return adapter.validateUrl(url) }
export function uploadFromUrl(url: string) { return adapter.uploadFromUrl(url) }