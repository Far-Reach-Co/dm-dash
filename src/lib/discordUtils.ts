import fetch, { RequestInit, Response } from "node-fetch";

interface DiscordRequestInputOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, any>;
}

export async function DiscordRequest(
  endpoint: string,
  options: DiscordRequestInputOptions
): Promise<Response | unknown> {
  const url = `https://discord.com/api/v10/${endpoint}`;

  const processedBody = options.body ? JSON.stringify(options.body) : undefined;

  const headers = {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent": "5e-bot (https://5ebot.com), 1.0.2)",
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    body: processedBody,
    headers,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(JSON.stringify(data));
  }

  return await res.json();
}
