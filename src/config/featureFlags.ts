// ================================================
// featureFlags.ts — Purpose: Compile/runtime feature toggles
// Now controlled via environment variables
// ================================================
import { config } from './environment'

export const USE_API = config.features.useApi
export const ENABLE_REALTIME = config.features.enableRealTime