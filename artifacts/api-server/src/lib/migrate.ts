import { pool } from "@workspace/db";
import { logger } from "./logger";

/**
 * Creates all tables if they don't exist yet.
 * Runs once at startup — safe to call on every deploy.
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id          SERIAL PRIMARY KEY,
        username    TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_content (
        id          SERIAL PRIMARY KEY,
        key         TEXT NOT NULL UNIQUE,
        value       TEXT NOT NULL DEFAULT '',
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id          SERIAL PRIMARY KEY,
        platform    TEXT NOT NULL,
        label       TEXT NOT NULL,
        url         TEXT NOT NULL,
        icon        TEXT NOT NULL DEFAULT '',
        color       TEXT NOT NULL DEFAULT '#ffffff',
        order_index INTEGER NOT NULL DEFAULT 0,
        visible     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reels (
        id              SERIAL PRIMARY KEY,
        fb_video_id     TEXT NOT NULL UNIQUE,
        title           TEXT,
        description     TEXT,
        thumbnail_url   TEXT,
        permalink_url   TEXT NOT NULL,
        duration        INTEGER,
        fb_created_time TEXT,
        visible         BOOLEAN NOT NULL DEFAULT TRUE,
        order_index     INTEGER NOT NULL DEFAULT 0,
        synced_at       TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS session (
        sid    VARCHAR PRIMARY KEY,
        sess   JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire);
    `);

    logger.info("Database migrations completed");
  } catch (err) {
    logger.error({ err }, "Database migration failed");
    throw err;
  } finally {
    client.release();
  }
}
