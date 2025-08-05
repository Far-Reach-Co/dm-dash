import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export default async function setupRedisAdapter(io: any) {
  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
}
