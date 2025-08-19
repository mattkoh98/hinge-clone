// ================================================
// guards.tsx — Purpose: Route guards for auth gating
// Used by App.tsx or any route-level wrapper.
// ================================================
import { Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { ROUTES } from './routes';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const authed = !!localStorage.getItem('auth');
  if (!authed) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  return children;
}

export function PublicOnly({ children }: { children: JSX.Element }) {
  const authed = !!localStorage.getItem('auth');
  if (authed) return <Navigate to={ROUTES.swipe} replace />;
  return children;
}