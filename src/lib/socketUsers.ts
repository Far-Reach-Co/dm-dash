import { createClient } from "redis";

// Setup redis
export const redisClient = createClient();
redisClient.connect();
redisClient.on("error", (err) => console.log("Redis Client Error", err));

type User = {
  id: string;
  username: string;
  table: string;
};

async function userJoin(
  id: string,
  username: string,
  table: string
): Promise<User> {
  const user: User = { id, username, table };
  // Store user data in Redis
  await redisClient.hSet("users", id, JSON.stringify(user));
  return user;
}

async function getCurrentUser(id: string): Promise<User | null> {
  const userStr = await redisClient.hGet("users", id);
  if (!userStr) {
    return null;
  }
  return JSON.parse(userStr) as User;
}

async function userLeave(id: string): Promise<User | null> {
  const userStr = await redisClient.hGet("users", id);
  if (!userStr) {
    return null;
  }

  // Remove the user
  await redisClient.hDel("users", id);
  return JSON.parse(userStr) as User;
}

async function getTableUsers(table: string): Promise<User[]> {
  const users = await redisClient.hGetAll("users");
  if (!users) return [];

  return Object.values(users)
    .map((userStr) => JSON.parse(userStr) as User)
    .filter((user) => user.table === table);
}

export { userJoin, getCurrentUser, getTableUsers, userLeave };
