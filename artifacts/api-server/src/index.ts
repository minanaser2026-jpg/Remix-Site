import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "./lib/migrate";

const port = Number(process.env.PORT || "3000");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

// Start server immediately — don't block on migrations
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

// Run migrations in background after server is up
runMigrations()
  .then(() => logger.info("Database migrations completed"))
  .catch((err) => logger.error({ err }, "Database migration failed (non-fatal)"));
