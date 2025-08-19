// =============================================================
// events.ts — Purpose: Minimal event helpers for cross-component updates
// We use native CustomEvent to avoid adding a dependency.
// =============================================================
export const Events = {
  authChanged: 'auth-changed',
  likesChanged: 'likes-changed',
};

export function emit(name: string, detail?: any) {
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {}
}

export function on(name: string, handler: (e: CustomEvent) => void) {
  const wrapped = handler as EventListener;
  window.addEventListener(name, wrapped);
  return () => window.removeEventListener(name, wrapped);
}