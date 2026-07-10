import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enable SSL for any remote host (Supabase, Railway PG, Neon, etc.)
// Skip SSL only for local / loopback connections used in dev.
const dbUrl = process.env.DATABASE_URL ?? "";
const isLocalDb =
  dbUrl.includes("localhost") ||
  dbUrl.includes("127.0.0.1") ||
  dbUrl.includes("::1");

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

export * from "./schema";
