/**
 * API base URL.
 * - In production (Cloudflare Pages): VITE_API_URL points to the Railway backend.
 * - In development (Replit): falls back to BASE_URL (same-origin dev server).
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL || import.meta.env.BASE_URL
).replace(/\/$/, '');
