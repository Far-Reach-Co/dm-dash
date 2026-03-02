import db from "../dbconfig";

export interface CreateSrdQuestionEventInput {
  source: string;
  queryText: string;
  answerText?: string | null;
  isShort?: boolean;
  requestId?: string | null;
  sourceUserId?: string | null;
  sourceGuildId?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  metadataJson?: Record<string, unknown>;
}

function trimToNullable(value: unknown, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeSource(source: string): string {
  const normalized = source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_.-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "dm_dash_web";
}

export async function createSrdQuestionEvent(input: CreateSrdQuestionEventInput) {
  const query = {
    text: /*sql*/ `
      insert into public."SrdQuestionEvent" (
        source,
        query_text,
        answer_text,
        is_short,
        request_id,
        source_user_id,
        source_guild_id,
        client_ip,
        user_agent,
        metadata_json
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
    `,
    values: [
      normalizeSource(input.source),
      input.queryText,
      input.answerText ?? null,
      input.isShort === true,
      trimToNullable(input.requestId, 120),
      trimToNullable(input.sourceUserId, 120),
      trimToNullable(input.sourceGuildId, 120),
      trimToNullable(input.clientIp, 120),
      trimToNullable(input.userAgent, 500),
      JSON.stringify(input.metadataJson || {}),
    ],
  };

  await db.query(query);
}
