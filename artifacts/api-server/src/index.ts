import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "./lib/migrate";

const port = Number(process.env.PORT || "3000");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

// Run DB migrations before accepting traffic
runMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Startup migration failed — exiting");
    process.exit(1);
  });
