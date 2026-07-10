import pino from "pino";

// Only use pino-pretty when explicitly requested via LOG_PRETTY=1 (e.g. local
// dev). Serverless/bundled deployments (Netlify Functions, esbuild bundles)
// don't ship the pino-pretty worker thread module, and relying on
// `NODE_ENV !== "production"` is unsafe there because NODE_ENV isn't always
// set to "production" by the hosting platform — pino then tries to load the
// transport at runtime and crashes with "unable to determine transport
// target for pino-pretty".
const usePretty = process.env.LOG_PRETTY === "1";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(usePretty
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});
