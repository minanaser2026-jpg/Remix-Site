import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PgSession = connectPgSimple(session);

const app: Express = express();

// ── Session store (PostgreSQL-backed, works on Railway) ───────────────────────
app.use(
  session({
    store: new PgSession({
      pool,
      createTableIfMissing: false,
      tableName: "session",
    }),
    secret: (() => {
      if (!process.env.SESSION_SECRET) {
        throw new Error("SESSION_SECRET must be set");
      }
      return process.env.SESSION_SECRET;
    })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// The frontend is served from the same origin as this API (single
// path-based-routing domain in dev, same production domain), so we only
// need to allow same-origin requests plus anything explicitly allow-listed
// via ALLOWED_ORIGINS (comma-separated). Reflecting arbitrary origins with
// credentials:true would let any third-party site ride the admin session
// cookie, so we never do that.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const selfOrigin = `${req.protocol}://${req.get("host")}`;
  // Always allow: same origin, Cloudflare Pages, explicit allow-list
  const allowed =
    !origin ||
    origin === selfOrigin ||
    origin.endsWith(".pages.dev") ||
    origin.endsWith(".railway.app") ||
    allowedOrigins.includes(origin);
  cors({
    origin: allowed ? origin : false,
    credentials: true,
  })(req, res, next);
});

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Static frontend (Railway production) ─────────────────────────────────────
// Skipped on Netlify: the frontend is built and served separately from
// artifacts/remix-site/dist/public via the Netlify CDN, and this app only
// ever runs there inside a Lambda-based Netlify Function.
const isServerlessFunction = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
if (process.env.NODE_ENV === "production" && !isServerlessFunction) {
  // Default: repo root → artifacts/remix-site/dist/public
  const frontendDir =
    process.env.FRONTEND_DIR ||
    path.resolve(process.cwd(), "artifacts/remix-site/dist/public");

  app.use(express.static(frontendDir));

  // SPA fallback
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
  });
}

export default app;
