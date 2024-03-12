import { createClient } from "redis";

// Setup redis
export const redisClient = createClient();
redisClient.connect();
redisClient.on("error", (err) => console.log("Redis Client Error", err));

// on startup clear users in case of shutdown connection failure to ensure no doubles
redisClient.del("users");

type User = {
  id: string;
  username: string;
  table: string;
};

type Message = {
  userId: string;
  username: string;
  content: string;
  timestamp: string;
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

async function getChatLog(table: string) {
  const chatLogKey = `${table}-table-chatlog`;
  const messages = await redisClient.lRange(chatLogKey, 0, -1);
  return messages.map((message) => JSON.parse(message));
}

async function appendMessageToChatLog(table: string, message: Message) {
  const chatLogKey = `${table}-table-chatlog`;

  await redisClient.rPush(
    chatLogKey,
    JSON.stringify({
      userId: message.userId,
      username: message.username,
      content: message.content,
      timestamp: message.timestamp,
    })
  );

  // Keep only the last 100 messages
  await redisClient.lTrim(chatLogKey, -100, -1);
}

export {
  userJoin,
  getCurrentUser,
  getTableUsers,
  userLeave,
  getChatLog,
  appendMessageToChatLog,
};
