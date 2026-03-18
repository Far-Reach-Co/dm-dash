// Setup Dotenv for Env vars
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PORT } from "./config";
import logger from "./lib/logger.js";
import { server } from "./setupApp";
import setupRedisAdapter from "./setupRedisAdapter.js";
import setupSocketHandlers from "./setupSocket";

function main() {
  const io = setupSocketHandlers(server);
  setupRedisAdapter(io).catch((err) => {
    logger.error({ err }, "Failed to set up Redis adapter");
  });

  server.listen(PORT, () => {
    logger.info({ port: PORT }, "Server running");
  });
}

main();
