// ================================================
// routes.ts — Purpose: Single source of truth for app routes
// ================================================
export const ROUTES = {
  root: '/',
  login: '/login',
  signup: '/signup',
  onboarding: '/onboarding',
  swipe: '/swipe',
  likes: '/likes',
  likesSent: '/likes-sent',
  conversations: '/conversations',
  conversation: (id: string | number) => `/conversations/${id}`,
  profile: '/profile',
};