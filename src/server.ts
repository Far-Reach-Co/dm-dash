// Setup Dotenv for Env vars
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { server } from "./setupApp";
import setupRedisAdapter from "./setupRedisAdapter.js";
import setupSocketHandlers from "./setupSocket";

function main() {
  const io = setupSocketHandlers(server);
  setupRedisAdapter(io).catch(console.error);

  const PORT = 4000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main();
