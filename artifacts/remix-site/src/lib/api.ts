/**
 * API base URL.
 * - In production (Cloudflare Pages): leave VITE_API_URL unset.
 *   All /api/* requests go to the same origin and are proxied to Railway
 *   by the Cloudflare Pages Function at functions/api/[[path]].ts.
 * - In development (local): falls back to BASE_URL (same-origin dev server).
 *
 * Do NOT set VITE_API_URL to the Railway URL directly — that causes
 * cross-origin cookie issues and breaks session-based auth.
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/$/, '');
