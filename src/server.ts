// Setup Dotenv for Env vars
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { server } from "./setupApp";
import setupRedisAdapter from "./setupRedisAdapter.js";
import setupSocketHandlers from "./setupSocket";

function resolvePort(): number {
  const rawPort = process.env.PORT?.trim() || "4000";
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }
  return port;
}

function main() {
  const io = setupSocketHandlers(server);
  setupRedisAdapter(io).catch(console.error);

  const PORT = resolvePort();
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main();
