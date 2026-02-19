import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { getRedisUrl } from "./lib/redisConfig.js";

export default async function setupRedisAdapter(io: any) {
  const pubClient = createClient({ url: getRedisUrl() });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
}
