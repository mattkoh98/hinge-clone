// =============================================================
// adapters/http/client.ts — Purpose: Minimal fetch wrapper
// Centralizes baseURL, JSON parsing, and auth header wiring.
// (Stubs now; real baseURL/env later when backend is live.)
// =============================================================
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

import { config } from '../../config/environment'

const BASE_URL = config.api.baseUrl

function authHeader() {
  // For MVP: no token; later attach JWT/session if needed
  return {};
}

export async function http<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string,string> } = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  // Handle FormData vs JSON
  const isFormData = body instanceof FormData;
  const requestHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeader(),
    ...headers,
  };
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    credentials: 'include', // Include cookies for JWT sessions
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` - ${txt}` : ''}`);
  }
  // handle no-content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Convenience helpers
export const get  = <T,>(p: string) => http<T>(p, { method: 'GET' });
export const post = <T,>(p: string, b?: any) => http<T>(p, { method: 'POST', body: b });
export const put  = <T,>(p: string, b?: any) => http<T>(p, { method: 'PUT', body: b });
export const del  = <T,>(p: string) => http<T>(p, { method: 'DELETE' });