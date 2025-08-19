// likes.service.ts
// Service wrapper for Likes functionality.
// Delegates to LikesLocalAdapter for demo storage (localStorage).

import LikesLocalAdapter from "../adapters/local/likes.service";

export function getIncomingLikes() {
  return LikesLocalAdapter.getIncomingLikes();
}

export function getSentLikes() {
  return LikesLocalAdapter.getSentLikes();
}

export function sendLike(profile: any, meta?: { comment?: string; context?: string }) {
  return LikesLocalAdapter.sendLike(profile, meta);
}

export function removeIncomingLike(profileId: string) {
  return LikesLocalAdapter.removeIncomingLike(profileId);
}